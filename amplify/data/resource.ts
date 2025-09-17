import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

export const schema = a.schema({
  Company: a
    .model({
      id: a.id().required(),
      name: a.string(),
      primaryDomain: a.string().required(),
      // industry: a.enum(['CHEMICALS', 'PHARMACEUTICALS', 'BIOTECH', 'MATERIALS', 'OTHER']),
      // sizeBand: a.enum(['1-50', '51-200', '201-1k', '1k-5k', '5k+']),
      // region: a.enum(['NA', 'EU', 'APAC', 'OTHER']),
      // status: a.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
      users: a.hasMany("User", "companyId"),
      //assessments: a.hasMany("AssessmentInstance", "companyId"),
      createdAt: a.datetime().default(new Date().toISOString()),
      updatedAt: a.datetime().default(new Date().toISOString()),
    })
    .identifier(["id"])
    .authorization((allow) => [
      allow.authenticated(),
      allow.publicApiKey().to(["read"]),
    ]),

  User: a
    .model({
      id: a.id().required(),
      email: a.email().required(),
      name: a.string(),
      jobTitle: a.string(),
      //role: a.enum(['member', 'admin', 'facilitator']).default('member'),
      companyId: a.id(),
      company: a.belongsTo("Company", "companyId"),
      createdAt: a.datetime().default(new Date().toISOString()),
      updatedAt: a.datetime().default(new Date().toISOString()),
    })
    .identifier(["id"])
    .authorization((allow) => [allow.authenticated()]),

  getAssessmentData: a
    .query()
    .returns(
      a.customType({
        focusAreas: a.string().array().required(),
        maturityLevels: a.string().array().required(),
        gridData: a.json().required(),
      })
    )
    .authorization((allow) => [allow.authenticated(), allow.publicApiKey()])
    .handler(
      a.handler.custom({
        entry: "./get-assesment-data.js",
      })
    ),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
