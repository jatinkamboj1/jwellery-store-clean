pipeline {
    agent any // This agent needs Docker CLI and kubectl access

    parameters {
        string(name: 'PROJECT_NAME', defaultValue: 'apexcabs', description: 'The name of the project (e.g., apexcabs, projectalpha)')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '3'))
    }

    environment {
        // Static global configurations
        ACR_LOGIN_SERVER = "codebiceps.azurecr.io"
        ACR_CREDENTIAL_ID = "acr-codebiceps-login-creds" // Credential for ACR (Service Principal ID/Secret)
        KUBECONFIG_CREDENTIAL_ID = "KUBECONFIG_CREDENTIAL_ID" // CHANGEME: For example, "aks-prod-kubeconfig-secret-text"

        // Note: Project-specific and other path variables are set in the 'Initialize Parameters' stage
    }

    stages {
        stage('Initialize Parameters') {
            steps {
                script {
                    // Derive project-specific names from the PROJECT_NAME parameter
                    env.ACR_IMAGE_NAME = "${params.PROJECT_NAME}-app" // User-specified format
                    env.K8S_NAMESPACE = "${params.PROJECT_NAME}"
                    env.K8S_DEPLOYMENT_NAME_VALUE = "${params.PROJECT_NAME}-deployment" // Renamed for clarity
                    env.K8S_SERVICE_NAME_VALUE = "${params.PROJECT_NAME}-service"
                    env.PROJECT_APP_NAME_VALUE = "${params.PROJECT_NAME}-app" // Used for labels and selectors
                    env.K8S_CONTAINER_NAME_VALUE = "${params.PROJECT_NAME}-container"

                    // Other derived environment variables
                    env.IMAGE_NAME_WITH_REGISTRY = "${env.ACR_LOGIN_SERVER}/${env.ACR_IMAGE_NAME}"
                    env.K8S_DEPLOYMENT_FILE = "k8s/deployment.yaml" // Relative to the workspace root
                    env.K8S_SERVICE_FILE = "k8s/service.yaml"     // Relative to the workspace root

                    echo "Project Name: ${params.PROJECT_NAME}"
                    echo "ACR Image Name: ${env.ACR_IMAGE_NAME}"
                    echo "Kubernetes Namespace: ${env.K8S_NAMESPACE}"
                    echo "Kubernetes Deployment Name: ${env.K8S_DEPLOYMENT_NAME_VALUE}"
                    echo "Kubernetes Service Name: ${env.K8S_SERVICE_NAME_VALUE}"
                    echo "Project App Name (for labels/selectors): ${env.PROJECT_APP_NAME_VALUE}"
                    echo "Kubernetes Container Name: ${env.K8S_CONTAINER_NAME_VALUE}"
                    echo "Full Image Registry Path: ${env.IMAGE_NAME_WITH_REGISTRY}"
                    echo "Deployment File Path: ${env.K8S_DEPLOYMENT_FILE}"
                    echo "Service File Path: ${env.K8S_SERVICE_FILE}"
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
                echo "Code checked out."
            }
        }

        stage('Build & Tag Docker Image') {
            steps {
                script {
                    def commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.IMAGE_TAG = commitHash
                    env.FULL_IMAGE_NAME_WITH_TAG = "${env.IMAGE_NAME_WITH_REGISTRY}:${env.IMAGE_TAG}"

                    echo "Building Docker image: ${env.FULL_IMAGE_NAME_WITH_TAG}"
                    sh "docker build -t ${env.FULL_IMAGE_NAME_WITH_TAG} ."
                    echo "Docker image ${env.FULL_IMAGE_NAME_WITH_TAG} built."
                }
            }
        }

        stage('Push Docker Image to ACR') {
            steps {
                script {
                    echo "Pushing Docker image to ACR: ${env.FULL_IMAGE_NAME_WITH_TAG}"
                    withCredentials([usernamePassword(credentialsId: env.ACR_CREDENTIAL_ID, usernameVariable: 'ACR_SP_APP_ID', passwordVariable: 'ACR_SP_PASSWORD')]) {
                        sh "echo \"${ACR_SP_PASSWORD}\" | docker login ${env.ACR_LOGIN_SERVER} -u \"${ACR_SP_APP_ID}\" --password-stdin"
                        sh "docker push ${env.FULL_IMAGE_NAME_WITH_TAG}"
                        echo "Docker image ${env.FULL_IMAGE_NAME_WITH_TAG} pushed to ACR."
                        sh "docker logout ${env.ACR_LOGIN_SERVER}"
                    }
                }
            }
        }

        stage('Deploy to Azure Kubernetes Service (AKS)') {
            steps {
                script {
                    echo "Deploying ${env.FULL_IMAGE_NAME_WITH_TAG} to AKS namespace '${env.K8S_NAMESPACE}'"
                    withCredentials([file(credentialsId: env.KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG_FILE_ON_AGENT')]) {
                        echo "Kubeconfig secret file is available at: ${KUBECONFIG_FILE_ON_AGENT}"
                        
                        sh "echo 'DEBUG: Listing k8s directory before sed:'; ls -l k8s/"
                        sh "echo 'DEBUG: Content of ${env.K8S_DEPLOYMENT_FILE} before sed:'; cat '${env.K8S_DEPLOYMENT_FILE}' || echo 'Failed to cat deployment file before sed'"
                        sh "echo 'DEBUG: Content of ${env.K8S_SERVICE_FILE} before sed:'; cat '${env.K8S_SERVICE_FILE}' || echo 'Failed to cat service file before sed'"

                        // Substitute placeholders in deployment.yaml
                        sh "sed -i 's|__K8S_DEPLOYMENT_NAME_PLACEHOLDER__|${env.K8S_DEPLOYMENT_NAME_VALUE}|g' '${env.K8S_DEPLOYMENT_FILE}'"
                        sh "sed -i 's|__PROJECT_APP_NAME_PLACEHOLDER__|${env.PROJECT_APP_NAME_VALUE}|g' '${env.K8S_DEPLOYMENT_FILE}'"
                        sh "sed -i 's|__K8S_CONTAINER_NAME_PLACEHOLDER__|${env.K8S_CONTAINER_NAME_VALUE}|g' '${env.K8S_DEPLOYMENT_FILE}'"
                        // The image placeholder in deployment.yaml (codebiceps.azurecr.io/__PROJECT_APP_NAME_PLACEHOLDER__:latest) is also handled by the PROJECT_APP_NAME_VALUE substitution
                        // The existing sed for image tag update will still work on the result.

                        // Substitute placeholders in service.yaml
                        sh "sed -i 's|__K8S_SERVICE_NAME_PLACEHOLDER__|${env.K8S_SERVICE_NAME_VALUE}|g' '${env.K8S_SERVICE_FILE}'"
                        sh "sed -i 's|__PROJECT_APP_NAME_PLACEHOLDER__|${env.PROJECT_APP_NAME_VALUE}|g' '${env.K8S_SERVICE_FILE}'"
                        // If using namespace placeholder in YAMLs:
                        // sh "sed -i 's|__PROJECT_NAME__|${params.PROJECT_NAME}|g' '${env.K8S_DEPLOYMENT_FILE}'"
                        // sh "sed -i 's|__PROJECT_NAME__|${params.PROJECT_NAME}|g' '${env.K8S_SERVICE_FILE}'"

                        echo "DEBUG: Attempting to replace image tag in ${env.K8S_DEPLOYMENT_FILE}"
                        echo "DEBUG: Replacing 'image: ${env.IMAGE_NAME_WITH_REGISTRY}:.*' with 'image: ${env.FULL_IMAGE_NAME_WITH_TAG}'"
                        
                        // The actual sed command
                        sh "sed -i 's|image: ${env.IMAGE_NAME_WITH_REGISTRY}:.*|image: ${env.FULL_IMAGE_NAME_WITH_TAG}|g' '${env.K8S_DEPLOYMENT_FILE}'"
                        
                        sh "echo 'DEBUG: Content of ${env.K8S_DEPLOYMENT_FILE} after sed:'; cat '${env.K8S_DEPLOYMENT_FILE}' || echo 'Failed to cat deployment file after sed'"
                        sh "echo 'DEBUG: Verifying image line with grep after sed:'; grep 'image:' '${env.K8S_DEPLOYMENT_FILE}' || echo 'grep failed or image line not found'"

                        withEnv(["KUBECONFIG=${KUBECONFIG_FILE_ON_AGENT}"]) {
                            echo "Applying Kubernetes Service: ${env.K8S_SERVICE_FILE}"
                            sh "kubectl apply -f '${env.K8S_SERVICE_FILE}' --namespace '${env.K8S_NAMESPACE}' -v=7"

                            echo "Applying Kubernetes Deployment: ${env.K8S_DEPLOYMENT_FILE}"
                            sh "kubectl apply -f '${env.K8S_DEPLOYMENT_FILE}' --namespace '${env.K8S_NAMESPACE}' -v=7"

                            echo "Verifying deployment rollout status..."
                            sh "kubectl rollout status deployment/'${env.K8S_DEPLOYMENT_NAME_VALUE}' --namespace '${env.K8S_NAMESPACE}' --timeout=300s"

                            echo "Deployment to AKS complete for ${env.FULL_IMAGE_NAME_WITH_TAG}."
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Pipeline Succeeded!'
        }
        failure {
            echo 'Pipeline Failed.'
            // Example: send a notification
            // mail to: 'your-email@example.com',
            //      subject: "Jenkins Pipeline Failed: ${currentBuild.fullDisplayName}",
            //      body: "Check console output at ${env.BUILD_URL}"
        }
    }
} 