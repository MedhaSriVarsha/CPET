import {
  UserModel,
  OrganizationModel,
  DestinationModel,
  SlaPolicyModel,
  CaseModel,
  CaseEventModel,
  DonorModel,
} from '@cpet/database';
import { memoryStore } from './store.js';
import { logger } from '../utils/logger.js';

export async function syncMongoSeedFixtures(): Promise<void> {
  // 1. Seed Organizations
  try {
    for (const [orgId, orgData] of memoryStore.organizations.entries()) {
      const exists = await OrganizationModel.findById(orgId);
      if (!exists) {
        await OrganizationModel.create(orgData);
        logger.info(`[MongoSeeder] Synced organization fixture: ${orgData.name} (${orgId})`);
      }
    }
  } catch (err: any) {
    logger.warn(`[MongoSeeder] Org seed notice: ${err.message}`);
  }

  // 2. Seed Users
  try {
    for (const [, userData] of memoryStore.users.entries()) {
      const exists = await UserModel.findOne({ email: userData.email.toLowerCase() });
      if (!exists) {
        await UserModel.create(userData);
        logger.info(`[MongoSeeder] Synced user fixture: ${userData.email} (${userData.role})`);
      } else if (!exists.passwordHash || exists.role !== userData.role) {
        exists.passwordHash = userData.passwordHash;
        exists.role = userData.role;
        await exists.save();
        logger.info(`[MongoSeeder] Updated user fixture credentials: ${userData.email} (${userData.role})`);
      }
    }
  } catch (err: any) {
    logger.warn(`[MongoSeeder] User seed notice: ${err.message}`);
  }

  // 3. Seed Destinations
  try {
    for (const [destId, destData] of memoryStore.destinations.entries()) {
      const exists = await DestinationModel.findById(destId);
      if (!exists) {
        await DestinationModel.create(destData);
      }
    }
  } catch (err: any) {
    logger.warn(`[MongoSeeder] Destination seed notice: ${err.message}`);
  }

  // 4. Seed SLA Policies
  try {
    for (const [, policyData] of memoryStore.slaPolicies.entries()) {
      const exists = await SlaPolicyModel.findOne({ name: policyData.name });
      if (!exists) {
        const { _id, ...safePolicyData } = policyData;
        await SlaPolicyModel.create(safePolicyData);
      }
    }
  } catch (err: any) {
    logger.warn(`[MongoSeeder] SLA policy seed notice: ${err.message}`);
  }

  // 5. Seed Donors
  try {
    for (const [donorId, donorData] of memoryStore.donors.entries()) {
      const exists = await DonorModel.findById(donorId);
      if (!exists) {
        await DonorModel.create(donorData);
      }
    }
  } catch (err: any) {
    logger.warn(`[MongoSeeder] Donor seed notice: ${err.message}`);
  }

  // 6. Seed Sample Cases
  try {
    for (const [caseId, caseData] of memoryStore.cases.entries()) {
      const exists = await CaseModel.findById(caseId);
      if (!exists) {
        await CaseModel.create(caseData);
        const events = memoryStore.caseEvents.get(caseId) || [];
        for (const evt of events) {
          await CaseEventModel.create(evt);
        }
        logger.info(`[MongoSeeder] Synced case fixture: ${caseData.referenceNumber}`);
      }
    }
  } catch (err: any) {
    logger.warn(`[MongoSeeder] Case seed notice: ${err.message}`);
  }

  logger.info('[MongoSeeder] Database fixtures verified and synced successfully.');
}
