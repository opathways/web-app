import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const JobStatus = a.enum(["OPEN", "CLOSED"]);
const ApplicationStatus = a.enum(["NEW", "IN_REVIEW", "REJECTED", "HIRED"]);

const schema = a.schema({
  CompanyProfile: a
    .model({
      id: a.id().required(),
      name: a.string().required(),
      owner: a.string().required(),
    })
    .authorization((allow) => [
      allow.owner().to(["create", "read", "update", "delete"]).identityClaim("sub"),
      allow.groups(["ADMIN"]).to(["read", "update", "delete"])
    ])
    .hasMany("jobs", "companyID"),

  Job: a
    .model({
      id: a.id().required(),
      title: a.string().required(),
      description: a.string(),
      status: a.enum(JobStatus).required(),
      owner: a.string().required(),
      companyID: a.id().required(),
    })
    .authorization((allow) => [
      allow.groups(["EMPLOYER"]).to(["create"]),
      allow.owner().to(["read", "update", "delete"]).identityClaim("sub"),
      allow.authenticated().to(["read"]),
      allow.groups(["ADMIN"]).to(["create", "read", "update", "delete"])
    ])
    .belongsTo("company", "companyID")
    .hasMany("applications", "jobID"),

  Application: a
    .model({
      id: a.id().required(),
      jobID: a.id().required(),
      applicantId: a.string().required(),
      jobOwnerId: a.string().required(),
      status: a.enum(ApplicationStatus).required(),
    })
    .authorization((allow) => [
      allow.owner("applicantId").to(["create", "read", "delete"]),
      allow.owner("jobOwnerId").to(["read", "update"]),
      allow.groups(["ADMIN"]).to(["read", "update", "delete"])
    ])
    .belongsTo("job", "jobID"),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    userPoolAuthorizationMode: {
      userPoolId: "default"
    },
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
