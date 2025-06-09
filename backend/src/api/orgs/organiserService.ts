import { env } from '@/common/utils/envConfig';
import { PrismaClient } from '@prisma/client';
import { Logger } from '@/common/utils/logger';

const prisma = new PrismaClient();

interface CreateOrganizationInput {
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  contactEmail?: string;
  privyId: string;
}

interface CreateFormInput {
  name: string;
  description: string;
  formInputs: any;
  deadline?: Date;
  organizationId: string;
}

export class OrganiserService {
  async createOrganization(input: CreateOrganizationInput) {
    const existingOrg = await prisma.organization.findUnique({
      where: { name: input.name }
    });

    if (existingOrg) {
      throw new Error('Organization with this name already exists');
    }

    return prisma.organization.create({
      data: {
        name: input.name,
        description: input.description,
        logoUrl: input.logoUrl,
        website: input.website,
        contactEmail: input.contactEmail,
        privyId: input.privyId
      }
    });
  }

  async getAllOrganizations() {
    return prisma.organization.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOrganizationByName(name: string) {
    return prisma.organization.findUnique({
      where: { name }
    });
  }

  async createForm(input: CreateFormInput) {
    return prisma.form.create({
      data: {
        name: input.name,
        description: input.description,
        formInputs: input.formInputs,
        deadline: input.deadline,
        organizationId: input.organizationId
      }
    });
  }

  async getFormById(id: string) {
    return prisma.form.findUnique({
      where: { id },
      include: {
        organization: true
      }
    });
  }

  async getOrganizationForms(organizationId: string) {
    return prisma.form.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getFormData(formId: string) {
    return prisma.form.findUnique({
      where: { id: formId },
      include: {
        submissions: true
      }
    });
  }

  async getFormSubmissions(formId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      prisma.formSubmission.findMany({
        where: { formId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.formSubmission.count({
        where: { formId }
      })
    ]);

    return {
      submissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
} 