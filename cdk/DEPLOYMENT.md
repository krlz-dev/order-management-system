# Order Management System - AWS Deployment Guide

This guide walks you through deploying the Order Management System to AWS using CDK, with frontend on S3/CloudFront and backend on ECS Fargate Spot.

## Prerequisites

1. **AWS CLI configured** with your `personal` profile
2. **Node.js 18+** installed
3. **Docker** installed and running
4. **CDK Bootstrap** (if first time using CDK in this AWS account/region)

## Architecture

- **Frontend**: React app → S3 bucket → CloudFront distribution
- **Backend**: Spring Boot app → ECR repository → ECS Fargate Spot → Application Load Balancer
- **Infrastructure**: VPC with 2 AZs, NAT Gateway, Security Groups

## Deployment Steps

### 1. Bootstrap CDK (first time only)

```bash
cd cdk
npx cdk bootstrap --profile personal
```

### 2. Build and Deploy Backend

```bash
# Navigate to backend directory
cd ../backend

# Build the Docker image
docker build -t order-management-backend .

# Get ECR login token (replace REGION and ACCOUNT_ID)
aws ecr get-login-password --region us-east-1 --profile personal | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Deploy CDK stack first to create ECR repository
cd ../cdk
npx cdk deploy --profile personal

# Tag and push image to ECR (use ECR URI from CDK output)
cd ../backend
docker tag order-management-backend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/order-management-backend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/order-management-backend:latest

# Update ECS service to use new image (if already deployed)
aws ecs update-service --cluster order-management-cluster --service BackendService --force-new-deployment --profile personal
```

### 3. Build and Deploy Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Build the application
npm run build

# Deploy to S3 (this will be automated in future versions)
# Note: S3 bucket name will be in CDK outputs
aws s3 sync dist/ s3://order-management-frontend-ACCOUNT_ID --profile personal

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*" --profile personal
```

### 4. Access Your Application

After deployment, you'll get outputs with:
- **Frontend URL**: CloudFront distribution URL
- **Backend URL**: Application Load Balancer URL
- **ECR Repository URI**: For pushing new backend images

## Environment Variables

### Backend (Spring Boot)

The CDK stack sets these environment variables:
- `SPRING_PROFILES_ACTIVE=prod`

Add additional environment variables in the CDK stack if needed.

## Cost Optimization Features

1. **Fargate Spot**: 50-70% cost savings over regular Fargate
2. **Single NAT Gateway**: Reduces NAT costs
3. **CloudFront**: Reduces S3 data transfer costs
4. **Auto-scaling**: ECS service can scale to 0 when not used

## Monitoring and Logging

- **ECS Logs**: Available in CloudWatch under `/ecs/order-management-backend`
- **Load Balancer**: Health checks on `/actuator/health`
- **Metrics**: CloudWatch metrics for ECS, Load Balancer, and S3

## Updating the Application

### Backend Updates
1. Build new Docker image
2. Push to ECR with new tag
3. Update ECS service to force new deployment

### Frontend Updates
1. Build React app: `npm run build`
2. Sync to S3: `aws s3 sync dist/ s3://bucket-name`
3. Invalidate CloudFront cache

## Cleanup

To destroy all resources:

```bash
cd cdk
npx cdk destroy --profile personal
```

**Note**: This will delete all data. Make sure to backup any important data before destroying.

## Troubleshooting

### Common Issues

1. **ECR Authentication**: Make sure your AWS CLI profile has ECR permissions
2. **ECS Service Won't Start**: Check CloudWatch logs for container startup errors
3. **Frontend Not Loading**: Verify S3 bucket policy and CloudFront distribution
4. **Health Check Failures**: Ensure backend exposes `/actuator/health` endpoint

### Useful Commands

```bash
# Check ECS service status
aws ecs describe-services --cluster order-management-cluster --services BackendService --profile personal

# View ECS task logs
aws logs tail /ecs/order-management-backend --follow --profile personal

# Check CloudFront distribution status
aws cloudfront list-distributions --profile personal
```

## Security Considerations

- S3 bucket is not publicly accessible (CloudFront OAI used)
- ECS tasks run with minimal IAM permissions
- Security groups restrict traffic to necessary ports only
- All resources are deployed in private subnets where possible

## Scaling

The infrastructure supports:
- **Frontend**: Global CDN distribution via CloudFront
- **Backend**: Auto-scaling ECS service (can be configured)
- **Database**: Currently uses H2 in-memory (consider RDS for production)

For production workloads, consider:
1. Adding RDS database
2. Implementing auto-scaling policies
3. Adding monitoring and alerting
4. Setting up CI/CD pipelines