import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

export const schema = a.schema({

  Company: a.model({
    id: a.id().required(),
    name: a.string(),
    primaryDomain: a.string().required(),
    status: a.string(),
    users: a.hasMany('User', 'companyId'),
    //assessments: a.hasMany("AssessmentInstance", "companyId"),
    createdAt: a.datetime().default(new Date().toISOString()),
    updatedAt: a.datetime().default(new Date().toISOString()),
  }).identifier(['id'])
  .authorization((allow) => [allow.authenticated()]),


  User: a.model({
    id: a.id().required(),
    email: a.email().required(),
    name: a.string(),
    jobTitle: a.string(),
    companyId: a.id(),
    company: a.belongsTo('Company', 'companyId'),
    createdAt: a.datetime().default(new Date().toISOString()),
    updatedAt: a.datetime().default(new Date().toISOString()),
  })
  .identifier(["id"])
  .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
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
