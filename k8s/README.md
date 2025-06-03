# Kubernetes Deployment Guide

This directory contains the Kubernetes configuration files for deploying the Restaurants Backend application.

## Prerequisites

1. Kubernetes cluster (minikube, EKS, GKE, AKS, etc.)
2. `kubectl` configured to communicate with your cluster
3. Docker installed and configured
4. Docker Hub account (or another container registry)

## Deployment Steps

### 1. Build and Push Docker Image

1. Update the `Dockerfile` if needed
2. Update the `deploy.sh` script with your Docker Hub username
3. Build and push the Docker image:
   ```bash
   docker build -t your-docker-username/restaurants-backend:latest .
   docker push your-docker-username/restaurants-backend:latest
   ```

### 2. Deploy to Kubernetes

1. Make sure your `kubectl` is configured to the right cluster
2. Run the deployment script:
   ```bash
   ./k8s/deploy.sh
   ```

### 3. Verify Deployment

Check the status of your deployment:

```bash
kubectl get pods -n restaurants
kubectl get svc -n restaurants
```

## Accessing the Application

To access the application, you can use port-forwarding:

```bash
kubectl port-forward svc/restaurants-service 8080:80 -n restaurants
```

Then visit: http://localhost:8080

## Configuration

### Environment Variables

Environment variables are defined directly in the `deployment.yaml` file. You can modify them there as needed.

### Persistent Storage

The application stores data in a PersistentVolumeClaim. By default, it requests 1GB of storage. You can modify this in `pvc.yaml`.

### Scaling

To scale the application, update the `replicas` field in `deployment.yaml`.

## Scheduled Scraping

The application handles scheduled scraping internally using `node-cron`. The schedule is configured in the application code.

## Cleaning Up

To delete all resources:

```bash
kubectl delete namespace restaurants
```
