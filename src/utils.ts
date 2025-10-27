import { Contact, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* Get the true primary contact for a given contact. If the contact is secondary, follows linkedId to find the primary. */
export const getPrimaryContact = async (contact: Contact): Promise<Contact> => {
  if (contact.linkPrecedence === "primary") return contact;
  if (contact.linkedId) {
    return prisma.contact.findUniqueOrThrow({
      where: { id: contact.linkedId },
    });
  }
  return contact;
};

/* Fetch all contacts linked to a primary contact. */
export const getIdentityGroup = async (
  primaryId: number
): Promise<Contact[]> => {
  return prisma.contact.findMany({
    where: { OR: [{ id: primaryId }, { linkedId: primaryId }] },
    orderBy: { createdAt: "asc" },
  });
};

/* Determine if we need to create a new secondary contact */
export const shouldCreateNewContact = (
  found: Contact[],
  email?: string | null,
  phoneNumber?: string | null
): boolean => {
  const existingEmails = new Set(
    found.map((c) => c.email).filter(Boolean) as string[]
  );
  const existingPhones = new Set(
    found.map((c) => c.phoneNumber).filter(Boolean) as string[]
  );

  return !!(
    (email && !existingEmails.has(email)) ||
    (phoneNumber && !existingPhones.has(phoneNumber))
  );
};
