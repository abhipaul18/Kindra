export interface MissionVerificationProfile {
  id: string;
  category: string;
  expectedActivity: string;
  expectedObjects: string[];
  rejectObjects: string[];
  confidenceThreshold: number; // e.g. 85
  rewardKarma: number; // e.g. 50
  generatePrompt: (imageUrl?: string, notes?: string) => string;
}

function buildMissionPrompt(
  missionName: string,
  category: string,
  primaryObjects: string[],
  approvalGuidelines: string,
  rejectionGuidelines: string,
  sampleObjects: string[],
  imageUrl?: string,
  notes?: string
): string {
  return `
[KINDRA AI Vision Engine - Mission-Aware Primary Object Verification]

Target Mission: "${missionName}" (Category: ${category})

VERIFICATION PHILOSOPHY:
You are KINDRA's official primary object verification AI.
Focus on identifying the PRIMARY OBJECT(S) associated with the selected mission instead of requiring complex scene analysis.
Do NOT require a person performing an action, specific tools (e.g. shovels), active digging, or capturing the full activity mid-motion.
Do NOT reject valid images simply because of unique camera angles, poor lighting, weather conditions, day/night differences, or partial obscurity.
Use semantic understanding rather than strict text/keyword matching.

PRIMARY OBJECTS FOR THIS MISSION:
${primaryObjects.map((obj) => `- ${obj}`).join('\n')}

APPROVAL GUIDELINES:
${approvalGuidelines}

REJECTION GUIDELINES:
${rejectionGuidelines}

Report Notes / Context: "${notes || 'None provided'}"
${imageUrl ? `Uploaded Image URL: "${imageUrl}"` : ''}

Return ONLY valid JSON without any markdown formatting or surrounding codeblock text.

JSON Schema:
{
  "mission_match": true,
  "approved": true,
  "confidence": 95,
  "detected_objects": ${JSON.stringify(sampleObjects)},
  "reason": "The image clearly contains the primary objects required for the selected mission.",
  "fraud": false
}

CONFIDENCE THRESHOLD EVALUATION:
- 95 - 100: Very High Confidence (approved = true, mission_match = true)
- 85 - 94: Approve (approved = true, mission_match = true)
- 70 - 84: Needs Manual Review (approved = false, mission_match = true)
- Below 70: Reject (approved = false, mission_match = false)
`;
}

export const MISSION_PROFILES: Record<string, MissionVerificationProfile> = {
  // 1. Plant Tree
  tree_plantation: {
    id: 'tree_plantation',
    category: 'Tree Plantation',
    expectedActivity: 'Plant a Tree',
    confidenceThreshold: 85,
    rewardKarma: 50,
    expectedObjects: ['Tree', 'Sapling', 'Plant', 'Greenery', 'Bush', 'Small tree', 'Newly planted tree'],
    rejectObjects: ['Clearly no vegetation', 'Garbage dump only', 'Indoor room without plants', 'Screenshots'],
    generatePrompt: (imageUrl, notes) =>
      buildMissionPrompt(
        'Plant a Tree',
        'Tree Plantation',
        ['Tree', 'Sapling', 'Plant', 'Greenery', 'Bush', 'Small tree', 'Newly planted tree'],
        'APPROVE if one or more of these primary objects are clearly visible. Do NOT require a person planting, a shovel, soil digging, or watering.',
        'REJECT only if there is clearly no vegetation present or if the image is completely unrelated.',
        ['sapling', 'green plant', 'tree'],
        imageUrl,
        notes
      ),
  },

  // 2. Report Road Potholes
  road_damage: {
    id: 'road_damage',
    category: 'Road Damage',
    expectedActivity: 'Report Road Potholes',
    confidenceThreshold: 85,
    rewardKarma: 50,
    expectedObjects: ['Road', 'Asphalt', 'Pavement', 'Concrete Road', 'Street', 'Highway Surface', 'Damaged Road', 'Cracked Road', 'Broken Asphalt', 'Pothole'],
    rejectObjects: ['No road surface visible', 'Trees only', 'Food packets', 'Screenshots'],
    generatePrompt: (imageUrl, notes) =>
      buildMissionPrompt(
        'Report Road Potholes',
        'Road Damage',
        ['Road', 'Asphalt', 'Pavement', 'Concrete Road', 'Street', 'Highway Surface', 'Damaged Road', 'Cracked Road', 'Broken Asphalt', 'Pothole'],
        'APPROVE if a road surface is clearly visible. If potholes, cracks, broken asphalt, missing road surface, or severe road damage are detected, assign a higher confidence score. Do NOT require: Vehicles, People, Traffic, Road signs, GPS overlays.',
        'REJECT only if there is clearly no road or paved surface visible or the image is completely unrelated.',
        ['road', 'pothole'],
        imageUrl,
        notes
      ),
  },

  // 3. Garbage Cleanup
  garbage_cleanup: {
    id: 'garbage_cleanup',
    category: 'Garbage Cleanup',
    expectedActivity: 'Garbage Cleanup',
    confidenceThreshold: 85,
    rewardKarma: 50,
    expectedObjects: ['Garbage', 'Plastic waste', 'Trash', 'Litter', 'Waste bags'],
    rejectObjects: ['Healthy trees only', 'No waste visible', 'Screenshots'],
    generatePrompt: (imageUrl, notes) =>
      buildMissionPrompt(
        'Garbage Cleanup',
        'Garbage Cleanup',
        ['Garbage', 'Plastic waste', 'Trash', 'Litter', 'Waste bags'],
        'APPROVE if waste or garbage is clearly visible.',
        'REJECT if no garbage, trash, or waste is visible.',
        ['garbage', 'plastic waste', 'trash bags'],
        imageUrl,
        notes
      ),
  },

  // 4. Feed Stray Animals (Dogs)
  feed_dogs: {
    id: 'feed_dogs',
    category: 'Animal Welfare',
    expectedActivity: 'Feed Stray Animals',
    confidenceThreshold: 85,
    rewardKarma: 40,
    expectedObjects: ['Dog', 'Street Dog', 'Puppy', 'Cat', 'Street Cat', 'Cow', 'Goat', 'Bird', 'Animal', 'Food Bowl', 'Animal Food'],
    rejectObjects: ['No animal visible', 'Trees only', 'Screenshots'],
    generatePrompt: (imageUrl, notes) =>
      buildMissionPrompt(
        'Feed Stray Animals',
        'Animal Welfare',
        ['Dog', 'Street Dog', 'Puppy', 'Cat', 'Street Cat', 'Cow', 'Goat', 'Bird', 'Animal', 'Food Bowl', 'Animal Food'],
        'APPROVE if one or more animals are clearly visible. Increase confidence if food, feeding bowls, or feeding activity is also visible. Do NOT require: The user to appear, Hand feeding, Multiple animals, A complete feeding sequence.',
        'REJECT only if there are clearly no animals visible or the image is completely unrelated.',
        ['stray dog', 'food bowl', 'animal food'],
        imageUrl,
        notes
      ),
  },

  // 5. Feed Stray Animals (Cats)
  feed_cats: {
    id: 'feed_cats',
    category: 'Animal Welfare',
    expectedActivity: 'Feed Stray Animals',
    confidenceThreshold: 85,
    rewardKarma: 40,
    expectedObjects: ['Dog', 'Street Dog', 'Puppy', 'Cat', 'Street Cat', 'Cow', 'Goat', 'Bird', 'Animal', 'Food Bowl', 'Animal Food'],
    rejectObjects: ['No animal visible', 'Screenshots'],
    generatePrompt: (imageUrl, notes) =>
      buildMissionPrompt(
        'Feed Stray Animals',
        'Animal Welfare',
        ['Dog', 'Street Dog', 'Puppy', 'Cat', 'Street Cat', 'Cow', 'Goat', 'Bird', 'Animal', 'Food Bowl', 'Animal Food'],
        'APPROVE if one or more animals are clearly visible. Increase confidence if food, feeding bowls, or feeding activity is also visible. Do NOT require: The user to appear, Hand feeding, Multiple animals, A complete feeding sequence.',
        'REJECT only if there are clearly no animals visible or the image is completely unrelated.',
        ['stray cat', 'food bowl', 'cat food'],
        imageUrl,
        notes
      ),
  },

  // 6. Blood Donation
  blood_donation: {
    id: 'blood_donation',
    category: 'Blood Donation',
    expectedActivity: 'Blood Donation',
    confidenceThreshold: 85,
    rewardKarma: 100,
    expectedObjects: ['Blood bag', 'Donor chair', 'Medical donation setup', 'Hospital donation area', 'Blood donor card'],
    rejectObjects: ['No blood donation context visible', 'Road damage', 'Trees only', 'Screenshots'],
    generatePrompt: (imageUrl, notes) =>
      buildMissionPrompt(
        'Blood Donation',
        'Blood Donation',
        ['Blood bag', 'Donor chair', 'Medical donation setup', 'Hospital donation area', 'Blood donor card'],
        'APPROVE if the donation context or medical setup is clearly visible.',
        'REJECT if no blood donation setup is visible.',
        ['blood bag', 'donor chair', 'medical donation setup'],
        imageUrl,
        notes
      ),
  },

  // 7. Book Donation
  book_donation: {
    id: 'book_donation',
    category: 'Book Donation',
    expectedActivity: 'Book Donation',
    confidenceThreshold: 85,
    rewardKarma: 50,
    expectedObjects: ['Books', 'School books', 'Library books', 'Book donation box', 'Textbooks'],
    rejectObjects: ['No books visible', 'Garbage dumps', 'Road potholes', 'Screenshots'],
    generatePrompt: (imageUrl, notes) =>
      buildMissionPrompt(
        'Book Donation',
        'Book Donation',
        ['Books', 'School books', 'Library books', 'Book donation box', 'Textbooks'],
        'APPROVE if books intended for donation are clearly visible.',
        'REJECT if no books are visible.',
        ['books', 'textbooks', 'library books'],
        imageUrl,
        notes
      ),
  },

  // 8. Food Donation
  food_donation: {
    id: 'food_donation',
    category: 'Food Donation',
    expectedActivity: 'Food Donation',
    confidenceThreshold: 85,
    rewardKarma: 60,
    expectedObjects: ['Food packets', 'Meals', 'Food containers', 'Food distribution', 'Ration kits'],
    rejectObjects: ['No food visible', 'Road potholes', 'Garbage dumps', 'Screenshots'],
    generatePrompt: (imageUrl, notes) =>
      buildMissionPrompt(
        'Food Donation',
        'Food Donation',
        ['Food packets', 'Meals', 'Food containers', 'Food distribution', 'Ration kits'],
        'APPROVE if donated food, meals, or food distribution containers are clearly visible.',
        'REJECT if no food items are visible.',
        ['food packets', 'meals', 'food containers'],
        imageUrl,
        notes
      ),
  },

  // 9. Water Conservation
  water_conservation: {
    id: 'water_conservation',
    category: 'Water Conservation',
    expectedActivity: 'Water Conservation',
    confidenceThreshold: 85,
    rewardKarma: 60,
    expectedObjects: ['Water body', 'Rainwater harvesting', 'Water conservation infrastructure', 'Restoration activity', 'Water tanks'],
    rejectObjects: ['No water infrastructure visible', 'Road damage', 'Garbage dumps', 'Screenshots'],
    generatePrompt: (imageUrl, notes) =>
      buildMissionPrompt(
        'Water Conservation',
        'Water Conservation',
        ['Water body', 'Rainwater harvesting', 'Water conservation infrastructure', 'Restoration activity', 'Water tanks'],
        'APPROVE if the conservation activity or water infrastructure is visible.',
        'REJECT if no water conservation infrastructure or activity is visible.',
        ['rainwater harvesting', 'water body', 'conservation infrastructure'],
        imageUrl,
        notes
      ),
  },
};

export function getMissionVerificationProfile(key: string): MissionVerificationProfile {
  if (!key) return MISSION_PROFILES.tree_plantation;

  const normalized = key.toLowerCase().trim();

  // Explicit ID matches
  if (MISSION_PROFILES[normalized]) {
    return MISSION_PROFILES[normalized];
  }

  // Keyphrase semantic mapping
  if (normalized.includes('tree') || normalized.includes('plant') || normalized.includes('sapling') || normalized.includes('reforestation')) {
    return MISSION_PROFILES.tree_plantation;
  }
  if (normalized.includes('pothole') || normalized.includes('road') || normalized.includes('asphalt') || normalized.includes('pavement')) {
    return MISSION_PROFILES.road_damage;
  }
  if (normalized.includes('garbage') || normalized.includes('trash') || normalized.includes('litter') || normalized.includes('waste')) {
    return MISSION_PROFILES.garbage_cleanup;
  }
  if (normalized.includes('dog') || normalized.includes('animal') || normalized.includes('feed')) {
    return MISSION_PROFILES.feed_dogs;
  }
  if (normalized.includes('cat')) {
    return MISSION_PROFILES.feed_cats;
  }
  if (normalized.includes('blood')) {
    return MISSION_PROFILES.blood_donation;
  }
  if (normalized.includes('book') || normalized.includes('library')) {
    return MISSION_PROFILES.book_donation;
  }
  if (normalized.includes('food') || normalized.includes('meal') || normalized.includes('ration')) {
    return MISSION_PROFILES.food_donation;
  }
  if (normalized.includes('water') || normalized.includes('rainwater') || normalized.includes('conservation')) {
    return MISSION_PROFILES.water_conservation;
  }

  // Default Fallback Profile
  return MISSION_PROFILES.tree_plantation;
}
