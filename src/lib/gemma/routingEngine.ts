import type { SmartRoutingResult, ClassificationResult } from './types';

export function runSmartRouting(classification: ClassificationResult): SmartRoutingResult {
  const category = classification.category;

  let destinationDepartment = 'Municipal Governance Authority';
  let routingTargetEntity: SmartRoutingResult['routingTargetEntity'] = 'Municipality';
  let routingReasoning = 'Automated municipal dispatch based on activity classification.';

  switch (category) {
    case 'Road Damage':
      destinationDepartment = 'Public Works Department (PWD)';
      routingTargetEntity = 'PWD';
      routingReasoning = 'Road cavities, asphalt degradation, and structural pavement hazards automatically dispatched to PWD.';
      break;

    case 'Garbage Cleanup':
    case 'Recycling':
    case 'Sewage':
      destinationDepartment = 'Municipal Sanitation & Waste Management';
      routingTargetEntity = 'Municipality';
      routingReasoning = 'Solid waste accumulation, overflowing dumpsters, and sanitation issues dispatched to Municipal Services.';
      break;

    case 'Streetlight Failure':
    case 'Public Safety':
      destinationDepartment = 'Electricity & Municipal Power Department';
      routingTargetEntity = 'Electricity Department';
      routingReasoning = 'Broken luminaires, electrical hazards, and public street lighting failures dispatched to Electricity Board.';
      break;

    case 'Animal Rescue':
    case 'Animal Feeding':
      destinationDepartment = 'Animal Welfare & Rescue NGO Federation';
      routingTargetEntity = 'Animal Welfare NGO';
      routingReasoning = 'Stray animal distress, rescue calls, and feeding initiatives routed directly to accredited Animal Welfare NGOs.';
      break;

    case 'Blood Donation':
    case 'Medicine Donation':
      destinationDepartment = 'District General Hospital & Red Cross Network';
      routingTargetEntity = 'Hospital';
      routingReasoning = 'Blood donation verifications and medical supplies routed directly to District Hospital Networks.';
      break;

    case 'Volunteer Teaching':
    case 'Book Donation':
    case 'Food Donation':
    case 'NGO Volunteering':
    case 'Community Events':
    case 'Heritage Conservation':
      destinationDepartment = 'Community Development NGO Network';
      routingTargetEntity = 'NGO';
      routingReasoning = 'Social welfare, educational support, and community volunteering routed to partner NGOs.';
      break;

    case 'Water Leakage':
    case 'Water Conservation':
      destinationDepartment = 'Metropolitan Water Supply & Drainage Board';
      routingTargetEntity = 'Water Board';
      routingReasoning = 'Burst water mains, hydro leaks, and conservation efforts dispatched to Water Board Engineers.';
      break;

    default:
      destinationDepartment = 'City Civic Operations Control Center';
      routingTargetEntity = 'General Civic Authority';
      routingReasoning = 'General civic contribution queued for central municipal control center assignment.';
      break;
  }

  return {
    destinationDepartment,
    routingTargetEntity,
    routingReasoning,
  };
}
