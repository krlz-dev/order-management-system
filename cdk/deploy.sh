#!/bin/bash

# Order Management System Deployment Script
# Usage: ./deploy.sh [profile]

set -e

PROFILE=${1:-personal}
REGION=${AWS_DEFAULT_REGION:-us-east-1}

echo "🚀 Starting deployment with profile: $PROFILE"

# Function to get AWS account ID
get_account_id() {
    aws sts get-caller-identity --query Account --output text --profile $PROFILE
}

# Function to deploy CDK stack
deploy_cdk() {
    echo "📦 Deploying CDK infrastructure..."
    cd "$(dirname "$0")"
    
    # Install dependencies
    npm install
    
    # Build TypeScript
    npm run build
    
    # Deploy stack
    npx cdk deploy --profile $PROFILE --require-approval never
    
    # Get stack outputs
    echo "📋 Getting stack outputs..."
    STACK_OUTPUTS=$(aws cloudformation describe-stacks --stack-name OrderManagementStack --profile $PROFILE --query 'Stacks[0].Outputs')
    
    ECR_URI=$(echo $STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="ECRRepositoryURI") | .OutputValue')
    FRONTEND_URL=$(echo $STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="FrontendURL") | .OutputValue')
    BACKEND_URL=$(echo $STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="BackendURL") | .OutputValue')
    
    echo "✅ CDK deployment complete!"
    echo "ECR Repository: $ECR_URI"
    echo "Frontend URL: https://$FRONTEND_URL"
    echo "Backend URL: http://$BACKEND_URL"
    
    # Save outputs for later use
    echo "ECR_URI=$ECR_URI" > .env
    echo "FRONTEND_URL=$FRONTEND_URL" >> .env
    echo "BACKEND_URL=$BACKEND_URL" >> .env
}

# Function to build and push backend
deploy_backend() {
    echo "🐳 Building and deploying backend..."
    
    # Source the outputs
    source .env
    
    cd ../backend
    
    # Build Docker image
    echo "Building Docker image..."
    docker build -t order-management-backend .
    
    # Get ECR login
    echo "Logging into ECR..."
    aws ecr get-login-password --region $REGION --profile $PROFILE | docker login --username AWS --password-stdin $ECR_URI
    
    # Tag and push
    echo "Pushing to ECR..."
    docker tag order-management-backend:latest $ECR_URI:latest
    docker push $ECR_URI:latest
    
    # Force new ECS deployment
    echo "Updating ECS service..."
    aws ecs update-service --cluster order-management-cluster --service BackendService --force-new-deployment --profile $PROFILE > /dev/null
    
    echo "✅ Backend deployment complete!"
    
    cd ../cdk
}

# Function to build and deploy frontend
deploy_frontend() {
    echo "⚛️  Building and deploying frontend..."
    
    # Source the outputs
    source .env
    
    cd ../frontend
    
    # Install dependencies and build
    echo "Building React app..."
    npm install
    npm run build
    
    # Get S3 bucket name from ECR URI (same account pattern)
    ACCOUNT_ID=$(get_account_id)
    BUCKET_NAME="order-management-frontend-$ACCOUNT_ID"
    
    # Deploy to S3
    echo "Uploading to S3..."
    aws s3 sync dist/ s3://$BUCKET_NAME --profile $PROFILE --delete
    
    # Get CloudFront distribution ID
    DIST_ID=$(aws cloudfront list-distributions --profile $PROFILE --query "DistributionList.Items[?Comment==''].Id" --output text)
    
    if [ "$DIST_ID" != "None" ] && [ ! -z "$DIST_ID" ]; then
        echo "Invalidating CloudFront cache..."
        aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*" --profile $PROFILE > /dev/null
    fi
    
    echo "✅ Frontend deployment complete!"
    echo "🌐 Frontend URL: https://$FRONTEND_URL"
    
    cd ../cdk
}

# Main deployment flow
main() {
    echo "🏗️  Order Management System Deployment"
    echo "========================================"
    
    # Check prerequisites
    command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI is required but not installed."; exit 1; }
    command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }
    command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
    command -v jq >/dev/null 2>&1 || { echo "❌ jq is required but not installed."; exit 1; }
    
    # Deploy infrastructure
    deploy_cdk
    
    # Deploy backend
    deploy_backend
    
    # Deploy frontend
    deploy_frontend
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "========================================"
    echo "Frontend: https://$FRONTEND_URL"
    echo "Backend:  http://$BACKEND_URL"
    echo ""
    echo "💡 Remember to update your frontend API configuration to use the backend URL"
}

# Run main function
main