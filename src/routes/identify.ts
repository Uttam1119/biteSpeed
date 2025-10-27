import { Router } from "express";
import { prisma } from "../prismaClient";
import { Contact } from "@prisma/client";
import {
  getPrimaryContact,
  getIdentityGroup,
  shouldCreateNewContact,
} from "../utils";

const router = Router();

router.post("/identify", async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res
        .status(400)
        .json({ error: "At least one of email or phoneNumber is required" });
    }

    // Step 1: Find contacts matching email or phoneNumber
    const orConditions: any[] = [];
    if (email) orConditions.push({ email });
    if (phoneNumber) orConditions.push({ phoneNumber });

    const found: Contact[] = await prisma.contact.findMany({
      where: orConditions.length ? { OR: orConditions } : {},
      orderBy: { createdAt: "asc" },
    });

    let primary: Contact;

    // Step 2: If no match, create a new primary
    if (found.length === 0) {
      primary = await prisma.contact.create({
        data: { email, phoneNumber, linkPrecedence: "primary" },
      });
    } else {
      // Determine primary from found contacts
      const maybePrimary =
        found.find((c) => c.linkPrecedence === "primary") ?? found[0];
      primary = await getPrimaryContact(maybePrimary);

      // Update other contacts to secondary
      const toUpdate = found.filter((c) => c.id !== primary.id);
      for (const c of toUpdate) {
        if (c.linkPrecedence !== "secondary" || c.linkedId !== primary.id) {
          await prisma.contact.update({
            where: { id: c.id },
            data: { linkPrecedence: "secondary", linkedId: primary.id },
          });
        }
      }

      // Create new secondary contact if needed
      if (shouldCreateNewContact(found, email, phoneNumber)) {
        await prisma.contact.create({
          data: {
            email: email ?? undefined,
            phoneNumber: phoneNumber ?? undefined,
            linkPrecedence: "secondary",
            linkedId: primary.id,
          },
        });
      }
    }

    // Step 3: Fetch all contacts linked to primary
    const identityGroup = await getIdentityGroup(primary.id);

    const emails = Array.from(
      new Set(identityGroup.map((c) => c.email).filter(Boolean))
    );
    const phoneNumbers = Array.from(
      new Set(identityGroup.map((c) => c.phoneNumber).filter(Boolean))
    );
    const secondaryContactIds = identityGroup
      .filter((c) => c.linkPrecedence === "secondary")
      .map((c) => c.id);

    return res.json({
      contact: {
        primaryContatctId: primary.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
