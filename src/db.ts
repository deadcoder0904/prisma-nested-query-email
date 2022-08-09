import { Prisma, License, User, Product } from '@prisma/client'

import { prisma } from './context'

const getLicenses = async (): Promise<Array<
  License & Pick<User, 'email'>
> | null> => {
  const userSelect = Prisma.validator<Prisma.ProductSelect>()({
    user: {
      select: {
        email: true,
      },
    },
  })

  const productSelect = Prisma.validator<Prisma.LicenseSelect>()({
    product: {
      include: userSelect,
    },
  })

  const licenses = await prisma.license.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: productSelect,
  })
  const result = licenses.map((currentLicense) => {
    const email = currentLicense.product?.user.email

    return {
      ...currentLicense,
      email: email || null,
    }
  })

  return result
}

const createLicense = async ({
  name,
  total,
}: {
  name: string
  total: number
}): Promise<License> => {
  return await prisma.license.create({
    data: {
      name,
      total,
    },
  })
}

export const db = {
  getLicenses,
  createLicense,
}
