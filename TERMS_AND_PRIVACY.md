# KINDRA Enterprise Legal Compliance, Terms of Service & Privacy Policy

**Effective Date**: January 1, 2026 | **Version**: 1.0.0

---

## 🔒 1. Privacy Policy (GDPR & CCPA Compliant)

### **1.1 Information We Collect**
- **Account Data**: Full name, email address, phone number, role (`citizen`, `officer`, `partner`, `admin`).
- **Civic Report Data**: Issue photos, title, description, category, and exact GPS location coordinates (Latitude/Longitude).
- **System Usage & Audit Data**: IP address, user agent, action timestamps recorded in `activity_logs`.

### **1.2 How Information Is Used**
- **Municipal Dispatch**: Incident GPS coordinates and descriptions are shared with designated municipal officers for resolution.
- **AI Processing**: Report text and images are processed via OpenRouter Gemma Vision AI for verification, classification, and duplicate detection.
- **Karma & Gamification**: Report metrics determine Karma point awards and leaderboard rankings.

### **1.3 Data Protection & Storage**
- All data is encrypted in transit (TLS 1.3/HTTPS) and at rest (AES-256 via Supabase PostgreSQL).
- Photo uploads in Supabase Storage (`reports` bucket) are subject to Row Level Security (RLS) policies.

### **1.4 Right to Be Forgotten (Data Deletion Request)**
- Users can request complete profile soft-deletion or hard erasure.
- Initiating a data deletion request marks `deleted_at = NOW()` on `profiles`, rendering the user inaccessible across all portals.

---

## 📜 2. Terms of Service

### **2.1 Acceptance of Terms**
By accessing or using the KINDRA Platform, citizens, officers, business partners, and administrators agree to abide by these Terms.

### **2.2 Citizen Conduct & Fair Use**
- Citizens must only submit genuine, real-world civic infrastructure concerns.
- Submitting fraudulent, offensive, or malicious submissions will result in immediate account suspension and Karma forfeiture.

### **2.3 Non-Monetary Nature of Karma Points**
- Karma points, milestone credentials, and badges are virtual civic recognition tokens.
- Karma points have **no cash value** and cannot be redeemed for fiat currency. Partner rewards represent voluntary promotional offers provided by participating businesses.

### **2.4 Municipal Liability Disclaimer**
- KINDRA acts as a civic engagement platform. Municipal response times and issue resolutions remain under the sole jurisdiction of local municipal authorities.

---

## 🍪 3. Cookie & Consent Management

KINDRA utilizes essential functional cookies strictly for authentication session persistence (`sb-access-token`, `sb-refresh-token`). No third-party tracking or advertising cookies are utilized.
