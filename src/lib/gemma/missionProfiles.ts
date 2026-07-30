export interface MissionVerificationProfile {
  id: string;
  category: string;
  expectedActivity: string;
  expectedObjects: string[];
  rejectObjects: string[];
  generatePrompt: (imageUrl?: string, notes?: string) => string;
}

const MISSION_PROFILES: Record<string, MissionVerificationProfile> = {
  // 1. Plant a Tree
  'tree_plantation': {
    id: 'tree_plantation',
    category: 'Tree Plantation',
    expectedActivity: 'Tree Plantation / Sapling Planting',
    expectedObjects: ['tree planting', 'sapling', 'digging soil', 'watering tree', 'newly planted tree', 'green foliage', 'gardening tools', 'young tree'],
    rejectObjects: ['potholes', 'garbage', 'blood donation', 'books', 'selfies', 'screenshots', 'indoor bedrooms', 'cars', 'road damage'],
    generatePrompt: (imageUrl, notes) => `
You are KINDRA's official AI Verification Engine.

Mission: "Plant a Tree" (Category: Tree Plantation)

Question: Does this image satisfy the requirements of the selected mission: "Plant a Tree"?

Requirements to consider:
- 🌱 Sapling, young tree, plant foliage, or newly planted tree visible
- 🌍 Outdoor soil, garden, park, forest, or planting container environment
- 👤 Person planting (optional - a clear photo of a newly planted sapling in soil is fully valid even without a person)

Notes/Context: "${notes || 'None provided'}"
${imageUrl ? `Uploaded Image URL: "${imageUrl}"` : ''}

Return ONLY valid JSON. No markdown backticks, no explanatory text around JSON.

Schema:
{
  "mission_match": true,
  "confidence": 94,
  "detected_activity": "Tree Sapling in Soil",
  "detected_objects": ["sapling", "soil", "leaves"],
  "reason": "The image clearly shows a newly planted young tree sapling in soil.",
  "fraud": false
}
`,
  },

  // 2. Report Road Potholes
  'road_damage': {
    id: 'road_damage',
    category: 'Road Damage',
    expectedActivity: 'Road Potholes / Damaged Road',
    expectedObjects: ['pothole', 'cracked road', 'damaged asphalt', 'broken road', 'road surface damage', 'road hazard', 'pavement cavity'],
    rejectObjects: ['trees', 'plants', 'garbage', 'blood donation', 'books', 'food', 'classrooms', 'screenshots', 'indoor furniture'],
    generatePrompt: (imageUrl, notes) => `
You are KINDRA's official AI Verification Engine.

Mission: "Report Road Potholes" (Category: Road Damage)

Question: Does this image satisfy the requirements of the selected mission: "Report Road Potholes"?

Requirements to consider:
- 🕳️ Pothole, asphalt damage, road surface crack, broken pavement, or street cavity visible
- 🛣️ Roadway, street, highway, or public transit surface context

Notes/Context: "${notes || 'None provided'}"
${imageUrl ? `Uploaded Image URL: "${imageUrl}"` : ''}

Return ONLY valid JSON. No markdown backticks, no explanatory text around JSON.

Schema:
{
  "mission_match": true,
  "confidence": 95,
  "detected_activity": "Road Pothole Hazard",
  "detected_objects": ["asphalt", "pothole", "street"],
  "reason": "Deep cavity and crack damage visible on asphalt road surface.",
  "fraud": false
}
`,
  },

  // 3. Garbage Cleanup
  'garbage_cleanup': {
    id: 'garbage_cleanup',
    category: 'Garbage Cleanup',
    expectedActivity: 'Garbage Cleanup Activity',
    expectedObjects: ['garbage', 'trash', 'litter', 'volunteers cleaning', 'trash bags', 'dumpster cleanup', 'recycling collection'],
    rejectObjects: ['roads', 'potholes', 'trees', 'blood donation', 'food', 'classrooms', 'animals', 'screenshots'],
    generatePrompt: (imageUrl, notes) => `
You are KINDRA's official AI Verification Engine.

Mission: "Garbage Cleanup" (Category: Garbage Cleanup)

Question: Does this image satisfy the requirements of the selected mission: "Garbage Cleanup"?

Requirements to consider:
- 🧹 Waste, litter, trash pile, trash bags, or active cleanup site visible
- 🧤 Cleaning equipment, gloves, bins, or volunteers collecting trash (optional)

Notes/Context: "${notes || 'None provided'}"
${imageUrl ? `Uploaded Image URL: "${imageUrl}"` : ''}

Return ONLY valid JSON. No markdown backticks, no explanatory text around JSON.

Schema:
{
  "mission_match": true,
  "confidence": 94,
  "detected_activity": "Garbage Cleanup Drive",
  "detected_objects": ["trash bags", "waste litter", "gloves"],
  "reason": "Litter collection and filled waste bags at public sanitation drive.",
  "fraud": false
}
`,
  },

  // 4. Blood Donation
  'blood_donation': {
    id: 'blood_donation',
    category: 'Blood Donation',
    expectedActivity: 'Blood Donation Drive',
    expectedObjects: ['blood donation chair', 'blood bag', 'donor', 'hospital', 'medical equipment', 'donor card'],
    rejectObjects: ['trees', 'potholes', 'garbage', 'books', 'classrooms', 'animals', 'food', 'screenshots'],
    generatePrompt: (imageUrl, notes) => `
You are KINDRA's official AI Verification Engine.

Mission: "Blood Donation Drive" (Category: Blood Donation)

Question: Does this image satisfy the requirements of the selected mission: "Blood Donation Drive"?

Requirements to consider:
- 💉 Blood donation bag, clinical collection chair, blood donor card, hospital clinic setup, or donor donating blood

Notes/Context: "${notes || 'None provided'}"
${imageUrl ? `Uploaded Image URL: "${imageUrl}"` : ''}

Return ONLY valid JSON. No markdown backticks, no explanatory text around JSON.

Schema:
{
  "mission_match": true,
  "confidence": 97,
  "detected_activity": "Blood Donation",
  "detected_objects": ["blood card", "clinical setting", "donor"],
  "reason": "Official blood donor card and clinical donation setup clearly visible.",
  "fraud": false
}
`,
  },

  // 5. Food Donation
  'food_donation': {
    id: 'food_donation',
    category: 'Food Donation',
    expectedActivity: 'Food Donation Distribution',
    expectedObjects: ['food distribution', 'meal serving', 'donated food', 'beneficiaries', 'ration packets'],
    rejectObjects: ['potholes', 'trees', 'garbage', 'blood donation', 'books', 'classrooms', 'animals', 'screenshots'],
    generatePrompt: (imageUrl, notes) => `
You are KINDRA's official AI Verification Engine.

Mission: "Food Donation" (Category: Food Donation)

Question: Does this image satisfy the requirements of the selected mission: "Food Donation"?

Requirements to consider:
- 🍱 Prepared meals, food packets, ration boxes, or active meal distribution to community members visible

Notes/Context: "${notes || 'None provided'}"
${imageUrl ? `Uploaded Image URL: "${imageUrl}"` : ''}

Return ONLY valid JSON. No markdown backticks, no explanatory text around JSON.

Schema:
{
  "mission_match": true,
  "confidence": 95,
  "detected_activity": "Community Food Drive",
  "detected_objects": ["meal packets", "food container", "beneficiaries"],
  "reason": "Cooked meal packets being served to community beneficiaries.",
  "fraud": false
}
`,
  },

  // 6. Book Donation
  'book_donation': {
    id: 'book_donation',
    category: 'Book Donation',
    expectedActivity: 'Book Donation to Library / School',
    expectedObjects: ['books', 'donated books stack', 'library shelves', 'educational material'],
    rejectObjects: ['potholes', 'trees', 'garbage', 'blood donation', 'food', 'animals', 'screenshots'],
    generatePrompt: (imageUrl, notes) => `
You are KINDRA's official AI Verification Engine.

Mission: "Book Donation" (Category: Book Donation)

Question: Does this image satisfy the requirements of the selected mission: "Book Donation"?

Requirements to consider:
- 📚 Stacks of textbooks, donated literature, library shelves, or educational book drop-off visible

Notes/Context: "${notes || 'None provided'}"
${imageUrl ? `Uploaded Image URL: "${imageUrl}"` : ''}

Return ONLY valid JSON. No markdown backticks, no explanatory text around JSON.

Schema:
{
  "mission_match": true,
  "confidence": 96,
  "detected_activity": "Educational Book Donation",
  "detected_objects": ["books", "textbooks", "library"],
  "reason": "Stack of donated educational books for library distribution.",
  "fraud": false
}
`,
  },

  // 7. Volunteer Teaching
  'volunteer_teaching': {
    id: 'volunteer_teaching',
    category: 'Volunteer Teaching',
    expectedActivity: 'Volunteer Teaching Session',
    expectedObjects: ['classroom', 'teacher', 'blackboard', 'students studying', 'school desk'],
    rejectObjects: ['potholes', 'trees', 'garbage', 'blood donation', 'food', 'animals', 'screenshots'],
    generatePrompt: (imageUrl, notes) => `
You are KINDRA's official AI Verification Engine.

Mission: "Volunteer Teaching" (Category: Volunteer Teaching)

Question: Does this image satisfy the requirements of the selected mission: "Volunteer Teaching"?

Requirements to consider:
- 👨‍🏫 Classroom, teacher at blackboard/whiteboard, students studying, educational tutoring session

Notes/Context: "${notes || 'None provided'}"
${imageUrl ? `Uploaded Image URL: "${imageUrl}"` : ''}

Return ONLY valid JSON. No markdown backticks, no explanatory text around JSON.

Schema:
{
  "mission_match": true,
  "confidence": 95,
  "detected_activity": "Volunteer Teaching Class",
  "detected_objects": ["blackboard", "students", "teacher"],
  "reason": "Volunteer conducting teaching session in classroom.",
  "fraud": false
}
`,
  },

  // 8. Animal Feeding
  'animal_feeding': {
    id: 'animal_feeding',
    category: 'Animal Feeding',
    expectedActivity: 'Stray Animal Feeding Drive',
    expectedObjects: ['dogs eating', 'cats eating', 'feeding bowls', 'volunteers feeding animals'],
    rejectObjects: ['potholes', 'garbage', 'blood donation', 'books', 'classrooms', 'screenshots'],
    generatePrompt: (imageUrl, notes) => `
You are KINDRA's official AI Verification Engine.

Mission: "Animal Feeding" (Category: Animal Feeding)

Question: Does this image satisfy the requirements of the selected mission: "Animal Feeding"?

Requirements to consider:
- 🐕 Stray animals (dogs, cats, cattle, birds) eating from food bowls or being fed by volunteers

Notes/Context: "${notes || 'None provided'}"
${imageUrl ? `Uploaded Image URL: "${imageUrl}"` : ''}

Return ONLY valid JSON. No markdown backticks, no explanatory text around JSON.

Schema:
{
  "mission_match": true,
  "confidence": 94,
  "detected_activity": "Stray Animal Feeding",
  "detected_objects": ["dogs", "food bowl", "feed"],
  "reason": "Volunteers serving food to community stray dogs.",
  "fraud": false
}
`,
  },

  // Fallback General Profile
  'default_profile': {
    id: 'default_profile',
    category: 'Civic Action',
    expectedActivity: 'Civic Contribution',
    expectedObjects: ['civic action', 'community contribution', 'volunteering'],
    rejectObjects: ['screenshots', 'blank image', 'unrelated media'],
    generatePrompt: (imageUrl, notes) => `
You are KINDRA's official AI Verification Engine.

Mission: "Civic Mission" (Category: Civic Contribution)

Question: Does this image satisfy the requirements of the selected civic mission?

Notes/Context: "${notes || 'None provided'}"
${imageUrl ? `Uploaded Image URL: "${imageUrl}"` : ''}

Return ONLY valid JSON. No markdown backticks, no explanatory text around JSON.

Schema:
{
  "mission_match": true,
  "confidence": 90,
  "detected_activity": "General Civic Action",
  "detected_objects": ["civic proof"],
  "reason": "Photo satisfies generic civic contribution guidelines.",
  "fraud": false
}
`,
  },
};

export function getMissionVerificationProfile(missionKeyOrTitle: string): MissionVerificationProfile {
  if (!missionKeyOrTitle) return MISSION_PROFILES['default_profile'];

  const normalized = missionKeyOrTitle.toLowerCase();

  if (normalized.includes('tree') || normalized.includes('plant') || normalized.includes('sapling')) {
    return MISSION_PROFILES['tree_plantation'];
  } else if (normalized.includes('pothole') || normalized.includes('road') || normalized.includes('asphalt')) {
    return MISSION_PROFILES['road_damage'];
  } else if (normalized.includes('garbage') || normalized.includes('trash') || normalized.includes('clean')) {
    return MISSION_PROFILES['garbage_cleanup'];
  } else if (normalized.includes('blood')) {
    return MISSION_PROFILES['blood_donation'];
  } else if (normalized.includes('food') || normalized.includes('meal')) {
    return MISSION_PROFILES['food_donation'];
  } else if (normalized.includes('book') || normalized.includes('textbook')) {
    return MISSION_PROFILES['book_donation'];
  } else if (normalized.includes('teach') || normalized.includes('class') || normalized.includes('school')) {
    return MISSION_PROFILES['volunteer_teaching'];
  } else if (normalized.includes('animal') || normalized.includes('feed')) {
    return MISSION_PROFILES['animal_feeding'];
  }

  return MISSION_PROFILES['default_profile'];
}
