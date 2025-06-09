#!/bin/bash
set -e

# Set your Docker username
DOCKER_USERNAME="dr.pnkt.dev/bf"
IMAGE_NAME="restaurants-backend-test"
TAG="latest"

# Authenticate with Docker Hub (uncomment if needed)
# docker login -u $DOCKER_USERNAME

# Build and push the Docker image
echo "Building Docker image..."
docker build -t $DOCKER_USERNAME/$IMAGE_NAME:$TAG .

echo "Pushing image to Docker Hub..."
docker push $DOCKER_USERNAME/$IMAGE_NAME:$TAG

# Apply Kubernetes configurations
echo "Applying Kubernetes configurations..."
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/pvc.yaml

echo "Deployment complete!"
