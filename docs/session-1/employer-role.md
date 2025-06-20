# EMPLOYER Role Definition

## Overview

The **EMPLOYER** role is a user group that provides authorized access for users who need to post job listings and manage job applicants within the job-board application.

## Implementation

The EMPLOYER role is implemented as an **Amazon Cognito user pool group** within the AWS Amplify Gen2 authentication system. This approach provides:

- Native integration with AWS Cognito's group-based authorization
- Seamless compatibility with Amplify's authentication flows
- Built-in support for role-based access control in AppSync GraphQL APIs

## Configuration

The EMPLOYER group is defined in the Amplify auth resource configuration:

```typescript
// amplify/auth/resource.ts
export const auth = defineAuth({
  loginWith: { email: true },
  groups: ["EMPLOYER"]
});
```

## Assigning Users to the EMPLOYER Group

### Option 1: Amplify CLI
```bash
# Add a user to the EMPLOYER group
amplify auth add-user-to-group --username <user-email> --group-name EMPLOYER
```

### Option 2: AWS Amplify Admin UI
1. Navigate to your Amplify app in the AWS Console
2. Go to the "Authentication" tab
3. Select "User management"
4. Find the target user and click "Add to group"
5. Select "EMPLOYER" from the group dropdown

### Option 3: AWS CLI (Advanced)
```bash
# Get the User Pool ID from your Amplify outputs
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <your-user-pool-id> \
  --username <user-email> \
  --group-name EMPLOYER
```

## Authorization Capabilities

Users in the EMPLOYER group will have permissions to:
- Create and publish job listings
- Edit their own job postings
- View and manage job applications
- Access employer-specific dashboard features

## Notes

- **Fallback Option**: The custom attribute approach (`custom:user:role = EMPLOYER`) is **not used** in this implementation. We rely exclusively on Cognito groups for role management.
- **Future Sessions**: AppSync authorization rules and API-level permissions will be configured in subsequent development sessions.
- **Scalability**: Additional employer-related groups (e.g., `EMPLOYER_ADMIN`, `EMPLOYER_RECRUITER`) can be added to the groups array as needed.
