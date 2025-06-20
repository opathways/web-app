import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== EMPLOYER DASHBOARD SCHEMA ==========================================
This schema defines the data models for the Employer Dashboard MVP:
- Company: Employer company profiles
- Job: Job postings created by employers  
- Application: Applications submitted by job seekers
All models require EMPLOYER group authentication.
=========================================================================*/
const schema = a.schema({
  Company: a
    .model({
      name: a.string().required(),
      description: a.string(),
      location: a.string(),
      website: a.string(),
      size: a.string(),
      employerId: a.string().required(),
    })
    .authorization((allow) => [allow.group("EMPLOYER")]),
  
  Job: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
      requirements: a.string(),
      status: a.enum(["ACTIVE", "INACTIVE", "DRAFT"]),
      companyId: a.id().required(),
      company: a.belongsTo("Company", "companyId"),
    })
    .authorization((allow) => [allow.group("EMPLOYER")]),
    
  Application: a
    .model({
      applicantName: a.string().required(),
      applicantEmail: a.string().required(),
      resume: a.string(),
      coverLetter: a.string(),
      status: a.enum(["NEW", "IN_REVIEW", "HIRED", "REJECTED"]),
      jobId: a.id().required(),
      job: a.belongsTo("Job", "jobId"),
      appliedAt: a.datetime(),
    })
    .authorization((allow) => [allow.group("EMPLOYER")]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    userPoolAuthorizationMode: {
      userPoolId: "default",
    },
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
