import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export class OrderManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Frontend S3 + CloudFront
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: `order-management-frontend-${this.account}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html'
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI');
    frontendBucket.grantRead(originAccessIdentity);

    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'FrontendDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: frontendBucket,
            originAccessIdentity: originAccessIdentity
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS
            }
          ]
        }
      ],
      errorConfigurations: [
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: '/index.html'
        }
      ]
    });

    // ECR Repository for backend
    const backendRepository = new ecr.Repository(this, 'BackendRepository', {
      repositoryName: 'order-management-backend',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // VPC for ECS
    const vpc = new ec2.Vpc(this, 'OrderManagementVpc', {
      maxAzs: 2,
      natGateways: 1
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'OrderManagementCluster', {
      vpc: vpc,
      clusterName: 'order-management-cluster'
    });

    // Task Definition for backend
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'BackendTaskDefinition', {
      memoryLimitMiB: 512,
      cpu: 256
    });

    const logGroup = new logs.LogGroup(this, 'BackendLogGroup', {
      logGroupName: '/ecs/order-management-backend',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_WEEK
    });

    taskDefinition.addContainer('backend', {
      image: ecs.ContainerImage.fromEcrRepository(backendRepository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({
        logGroup: logGroup,
        streamPrefix: 'backend'
      }),
      portMappings: [
        {
          containerPort: 8080,
          protocol: ecs.Protocol.TCP
        }
      ],
      environment: {
        'SPRING_PROFILES_ACTIVE': 'prod'
      }
    });

    // Security Group for ECS service
    const ecsSecurityGroup = new ec2.SecurityGroup(this, 'EcsSecurityGroup', {
      vpc: vpc,
      description: 'Security group for ECS service',
      allowAllOutbound: true
    });

    ecsSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8080),
      'Allow HTTP traffic on port 8080'
    );

    // Application Load Balancer
    const loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'BackendLoadBalancer', {
      vpc: vpc,
      internetFacing: true
    });

    const listener = loadBalancer.addListener('BackendListener', {
      port: 80,
      open: true
    });

    // ECS Fargate Service with Spot capacity
    const service = new ecs.FargateService(this, 'BackendService', {
      cluster: cluster,
      taskDefinition: taskDefinition,
      desiredCount: 1,
      securityGroups: [ecsSecurityGroup],
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT',
          weight: 1,
          base: 0
        }
      ],
      platformVersion: ecs.FargatePlatformVersion.LATEST
    });

    // Add service to load balancer target
    listener.addTargets('BackendTarget', {
      port: 8080,
      targets: [service],
      healthCheck: {
        path: '/actuator/health',
        interval: cdk.Duration.seconds(30)
      }
    });

    // Outputs
    new cdk.CfnOutput(this, 'FrontendURL', {
      value: distribution.distributionDomainName,
      description: 'Frontend CloudFront Distribution URL'
    });

    new cdk.CfnOutput(this, 'BackendURL', {
      value: loadBalancer.loadBalancerDnsName,
      description: 'Backend Load Balancer URL'
    });

    new cdk.CfnOutput(this, 'ECRRepositoryURI', {
      value: backendRepository.repositoryUri,
      description: 'ECR Repository URI for backend images'
    });
  }
}
