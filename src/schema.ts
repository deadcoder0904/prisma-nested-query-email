import {
  makeSchema,
  objectType,
  asNexusMethod,
  nonNull,
  stringArg,
  intArg,
} from 'nexus'
import { DateTimeResolver } from 'graphql-scalars'
import { prisma } from './context'
import { db } from './db'

export const DateTime = asNexusMethod(DateTimeResolver, 'date')

const License = objectType({
  name: 'License',
  definition(t) {
    t.nonNull.string('id')
    t.string('email')
    t.nonNull.string('name')
    t.nonNull.int('total')
    t.nonNull.int('used')
    t.nonNull.field('createdAt', { type: 'DateTime' })
  },
})

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.list.field('licenses', {
      type: 'License',
      resolve: async (_, __, ctx) => {
        const licenses = await db.getLicenses()

        if (licenses) return licenses
        return null
      },
    })
  },
})

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.nullable.field('createLicense', {
      type: 'License',
      args: {
        name: nonNull(stringArg()),
        total: nonNull(intArg()),
      },
      resolve: async (_, { name, total }, ctx) => {
        const licenseExists = await prisma.license.findMany({
          where: { name },
        })

        if (licenseExists.length) return null

        return await db.createLicense({ name, total })
      },
    })
  },
})

export const schema = makeSchema({
  types: [Query, Mutation, License, DateTime],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})
