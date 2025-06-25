import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  CompanyProfile: a
    .model({
      owner: a.string().required(),
      name: a.string().required(),
      description: a.string(),
      industry: a.string(),
      location: a.string(),
      website: a.url(),
      contactEmail: a.email(),
      size: a.string(),
      founded: a.string(),
      jobListings: a.hasMany("JobListing", "companyID"),
    })
    .authorization((allow) => [
      allow.groups(["EMPLOYER"]),
      allow.owner().to(["read", "create", "update"])
    ])
    .secondaryIndexes((index) => [
      index("owner").name("byOwner").queryField("companyProfilesByOwner")
    ]),

  JobListing: a
    .model({
      owner: a.string().required(),
      title: a.string().required(),
      description: a.string().required(),
      status: a.enum(["DRAFT", "ACTIVE", "CLOSED"]),
      postedAt: a.datetime(),
      companyID: a.id().required(),
      company: a.belongsTo("CompanyProfile", "companyID"),
      applications: a.hasMany("JobApplication", "jobID"),
    })
    .authorization((allow) => [
      allow.groups(["EMPLOYER"]),
      allow.owner().to(["read", "create", "update"])
    ])
    .secondaryIndexes((index) => [
      index("owner").name("byOwner").queryField("jobListingsByOwner"),
      index("companyID").name("byCompanyProfile")
    ]),

  JobApplication: a
    .model({
      owner: a.string().required(),
      jobID: a.id().required(),
      job: a.belongsTo("JobListing", "jobID"),
      applicantName: a.string(),
      applicantEmail: a.email(),
      resumeURL: a.url(),
      status: a.enum(["NEW", "IN_REVIEW", "HIRED", "REJECTED"]),
      appliedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.groups(["EMPLOYER"]),
      allow.owner().to(["read", "create", "update"])
    ])
    .secondaryIndexes((index) => [
      index("owner").name("byOwner").queryField("jobApplicationsByOwner"),
      index("jobID").name("byJobListing")
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
