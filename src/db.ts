import { Prisma, License, User } from '@prisma/client'

import { prisma } from './context'

export const getLicenses = async (): Promise<
  Array<License & Pick<User, 'email'>> | null | undefined
> => {
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

  const result = licenses.map((license) => {
    const email = license.product?.user.email

    if (email) {
      return {
        ...license,
        email,
      }
    }
  })

  return result
}

export const db = {
  getLicenses,
}
