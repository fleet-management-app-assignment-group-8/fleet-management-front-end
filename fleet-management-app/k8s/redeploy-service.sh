#!/bin/bash

# ===============================
# Fleet Frontend Redeploy Script
# ===============================
# Safely redeploys the fleet-frontend service in Kubernetes
# Usage: ./redeploy-service.sh [options]
#
# Options:
#   --image <image:tag>    Specify image to deploy (optional)
#   --namespace <ns>       Specify namespace (default: fleet-management)
#   --skip-secrets        Skip secret recreation
#   --force               Force delete pods immediately
#   --dry-run             Show what would be done without executing

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
NAMESPACE="fleet-management"
SKIP_SECRETS=true  # Changed: Skip secrets by default for safety
FORCE=false
DRY_RUN=false
NEW_IMAGE=""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --image)
      NEW_IMAGE="$2"
      shift 2
      ;;
    --namespace)
      NAMESPACE="$2"
      shift 2
      ;;
    --with-secrets)
      SKIP_SECRETS=false
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --image <image:tag>    Specify image to deploy (default: uses latest from deployment.yaml)"
      echo "  --namespace <ns>       Specify namespace (default: fleet-management)"
      echo "  --with-secrets         Also redeploy secrets (default: skip secrets)"
      echo "  --force               Force delete pods immediately"
      echo "  --dry-run             Show what would be done without executing"
      echo "  -h, --help            Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                                    # Redeploy with latest image, keep secrets"
      echo "  $0 --with-secrets                     # Redeploy everything including secrets"
      echo "  $0 --image harinejan/fleet-frontend:v1.0.0  # Deploy specific version"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Helper function to run commands
run_cmd() {
  if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}[DRY RUN] $@${NC}"
  else
    eval "$@"
  fi
}

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Fleet Frontend Redeployment${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  Namespace: $NAMESPACE"
echo "  Redeploy Secrets: $([ "$SKIP_SECRETS" = true ] && echo "No (use --with-secrets to include)" || echo "Yes")"
echo "  Force: $FORCE"
echo "  Dry Run: $DRY_RUN"
if [ -n "$NEW_IMAGE" ]; then
  echo "  Image: $NEW_IMAGE"
else
  echo "  Image: Using latest from deployment.yaml (harinejan/fleet-frontend:latest)"
fi
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed or not in PATH${NC}"
    exit 1
fi

# Check if namespace exists
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo -e "${RED}Error: Namespace '$NAMESPACE' does not exist${NC}"
    echo -e "${YELLOW}Creating namespace...${NC}"
    run_cmd "kubectl apply -f $SCRIPT_DIR/namespace.yaml"
fi

# Confirmation prompt (skip in dry-run mode)
if [ "$DRY_RUN" = false ]; then
  echo -e "${YELLOW}This will redeploy the fleet-frontend service.${NC}"
  echo -e "${YELLOW}Existing pods will be terminated and recreated.${NC}"
  echo ""
  read -p "Continue? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${YELLOW}Redeployment cancelled${NC}"
      exit 0
  fi
fi

echo ""
echo -e "${GREEN}Step 1: Backing up current deployment${NC}"
if [ "$DRY_RUN" = false ]; then
  kubectl get deployment fleet-frontend -n $NAMESPACE -o yaml > /tmp/fleet-frontend-backup-$(date +%Y%m%d-%H%M%S).yaml 2>/dev/null || true
  echo "  Backup saved to /tmp/fleet-frontend-backup-*.yaml"
fi

echo ""
echo -e "${GREEN}Step 2: Deleting existing resources${NC}"

# Delete deployment (this will also delete pods)
echo "  Deleting deployment..."
run_cmd "kubectl delete deployment fleet-frontend -n $NAMESPACE --ignore-not-found=true"

# Delete service (will be recreated)
echo "  Deleting service..."
run_cmd "kubectl delete service fleet-frontend -n $NAMESPACE --ignore-not-found=true"

# Delete HPA
echo "  Deleting HPA..."
run_cmd "kubectl delete hpa fleet-frontend-hpa -n $NAMESPACE --ignore-not-found=true"

# Delete Istio resources
echo "  Deleting Istio VirtualService..."
run_cmd "kubectl delete virtualservice fleet-frontend -n $NAMESPACE --ignore-not-found=true"
run_cmd "kubectl delete virtualservice fleet-frontend-gateway -n $NAMESPACE --ignore-not-found=true"

echo "  Deleting Istio DestinationRule..."
run_cmd "kubectl delete destinationrule fleet-frontend -n $NAMESPACE --ignore-not-found=true"

echo "  Deleting Istio Gateway..."
run_cmd "kubectl delete gateway fleet-frontend-gateway -n $NAMESPACE --ignore-not-found=true"

# Delete secrets only if --with-secrets flag is used
if [ "$SKIP_SECRETS" = false ]; then
  echo "  Deleting secrets (--with-secrets flag detected)..."
  run_cmd "kubectl delete secret fleet-frontend-secrets -n $NAMESPACE --ignore-not-found=true"
else
  echo "  Keeping existing secrets (use --with-secrets to redeploy)"
fi

# Delete ConfigMap
echo "  Deleting ConfigMap..."
run_cmd "kubectl delete configmap fleet-frontend-config -n $NAMESPACE --ignore-not-found=true"

# Wait for pods to terminate
if [ "$DRY_RUN" = false ]; then
  echo ""
  echo -e "${YELLOW}Waiting for pods to terminate...${NC}"
  kubectl wait --for=delete pod -l app=fleet-frontend -n $NAMESPACE --timeout=60s 2>/dev/null || true
  sleep 2
fi

echo ""
echo -e "${GREEN}Step 3: Applying updated configurations${NC}"

# Apply ConfigMap
echo "  Applying ConfigMap..."
run_cmd "kubectl apply -f $SCRIPT_DIR/configmap.yaml"

# Apply Secrets (only if --with-secrets flag is used)
if [ "$SKIP_SECRETS" = false ]; then
  echo "  Applying Secrets (--with-secrets flag detected)..."
  if [ -f "$SCRIPT_DIR/secret.yaml" ]; then
    run_cmd "kubectl apply -f $SCRIPT_DIR/secret.yaml"
  else
    echo -e "${YELLOW}  Warning: secret.yaml not found, skipping...${NC}"
  fi
else
  echo "  Skipping secrets (use --with-secrets to redeploy)"
fi

# Update image in deployment if specified
if [ -n "$NEW_IMAGE" ]; then
  echo "  Updating deployment with new image: $NEW_IMAGE"
  if [ "$DRY_RUN" = false ]; then
    # Create temporary deployment file with updated image
    sed "s|image: .*fleet-frontend.*|image: $NEW_IMAGE|g" $SCRIPT_DIR/deployment.yaml > /tmp/deployment-temp.yaml
    run_cmd "kubectl apply -f /tmp/deployment-temp.yaml"
    rm /tmp/deployment-temp.yaml
  else
    echo -e "${CYAN}[DRY RUN] Would update image to: $NEW_IMAGE${NC}"
  fi
else
  # Apply deployment as-is
  echo "  Applying Deployment..."
  run_cmd "kubectl apply -f $SCRIPT_DIR/deployment.yaml"
fi

# Apply Service
echo "  Applying Service..."
run_cmd "kubectl apply -f $SCRIPT_DIR/service.yaml"

# Apply HPA
echo "  Applying HPA..."
run_cmd "kubectl apply -f $SCRIPT_DIR/hpa.yaml"

# Apply Istio configurations
echo "  Applying Istio VirtualService..."
run_cmd "kubectl apply -f $SCRIPT_DIR/istio/virtualservice.yaml"

echo "  Applying Istio DestinationRule..."
run_cmd "kubectl apply -f $SCRIPT_DIR/istio/destinationrule.yaml"

echo "  Applying Istio Gateway..."
run_cmd "kubectl apply -f $SCRIPT_DIR/istio/gateway.yaml"

echo "  Applying Istio PeerAuthentication..."
run_cmd "kubectl apply -f $SCRIPT_DIR/istio/peerauthentication.yaml"

echo "  Applying Istio AuthorizationPolicy..."
run_cmd "kubectl apply -f $SCRIPT_DIR/istio/authorizationpolicy.yaml"

echo "  Applying Istio ServiceEntry..."
run_cmd "kubectl apply -f $SCRIPT_DIR/istio/serviceentry.yaml"

if [ "$DRY_RUN" = false ]; then
  echo ""
  echo -e "${GREEN}Step 4: Waiting for deployment to be ready${NC}"
  echo "  Waiting for pods to be ready..."
  
  # Wait for deployment to be available
  kubectl wait --for=condition=available --timeout=300s deployment/fleet-frontend -n $NAMESPACE || {
    echo -e "${RED}Deployment failed to become ready within timeout${NC}"
    echo -e "${YELLOW}Checking pod status...${NC}"
    kubectl get pods -n $NAMESPACE -l app=fleet-frontend
    echo ""
    echo -e "${YELLOW}Recent events:${NC}"
    kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -20
    exit 1
  }
  
  echo ""
  echo -e "${GREEN}Step 5: Verifying deployment${NC}"
  
  # Get pod status
  echo "  Pod Status:"
  kubectl get pods -n $NAMESPACE -l app=fleet-frontend
  
  echo ""
  echo "  Service Status:"
  kubectl get svc fleet-frontend -n $NAMESPACE
  
  echo ""
  echo "  HPA Status:"
  kubectl get hpa fleet-frontend-hpa -n $NAMESPACE
  
  echo ""
  echo "  Istio VirtualService:"
  kubectl get virtualservice -n $NAMESPACE
  
  echo ""
  echo -e "${GREEN}Step 6: Checking pod health${NC}"
  
  # Get first pod name
  POD_NAME=$(kubectl get pods -n $NAMESPACE -l app=fleet-frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
  
  if [ -n "$POD_NAME" ]; then
    echo "  Checking pod: $POD_NAME"
    
    # Check if pod is running
    POD_STATUS=$(kubectl get pod $POD_NAME -n $NAMESPACE -o jsonpath='{.status.phase}')
    echo "  Status: $POD_STATUS"
    
    # Check readiness
    READY=$(kubectl get pod $POD_NAME -n $NAMESPACE -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}')
    echo "  Ready: $READY"
    
    # Show recent logs
    echo ""
    echo "  Recent logs:"
    kubectl logs $POD_NAME -n $NAMESPACE --tail=10 2>/dev/null || echo "  (logs not available yet)"
  fi
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Redeployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

if [ "$DRY_RUN" = false ]; then
  echo -e "${YELLOW}Useful commands:${NC}"
  echo "  View logs:        kubectl logs -f deployment/fleet-frontend -n $NAMESPACE"
  echo "  View pods:        kubectl get pods -n $NAMESPACE -l app=fleet-frontend"
  echo "  View service:     kubectl get svc fleet-frontend -n $NAMESPACE"
  echo "  Describe pod:     kubectl describe pod <pod-name> -n $NAMESPACE"
  echo "  Check events:     kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp'"
  echo "  Scale manually:   kubectl scale deployment fleet-frontend --replicas=3 -n $NAMESPACE"
  echo ""
  echo -e "${YELLOW}Access the application:${NC}"
  EXTERNAL_IP=$(kubectl get svc istio-ingressgateway -n istio-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "<pending>")
  echo "  External IP: $EXTERNAL_IP"
  echo "  URL: http://$EXTERNAL_IP (or your configured domain)"
else
  echo -e "${CYAN}This was a dry run. No changes were made.${NC}"
  echo -e "${CYAN}Run without --dry-run to apply changes.${NC}"
fi

echo ""

