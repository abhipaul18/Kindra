# KINDRA Enterprise Operations & Disaster Recovery Runbook

**Version**: v1.0.0-enterprise | **Classification**: Confidential / Operations

---

## 🏛️ 1. Multi-Tenant Architecture & City Isolation

KINDRA supports multi-city and multi-tenant municipal deployments:

```
┌─────────────────────────────────────────────────────────────┐
│                    KINDRA Multi-Tenant SaaS                 │
├──────────────────────────────┬──────────────────────────────┤
│  Tenant City A (e.g. Austin) │  Tenant City B (e.g. Seattle)│
│  - Depts: Roads, Sanitation  │  - Depts: Utilities, Parks   │
│  - Partner Orgs: Coffee Co.  │  - Partner Orgs: EcoShop     │
└──────────────────────────────┴──────────────────────────────┘
```

- **Isolation Mechanism**: Database queries scope records by `assigned_department_id` for Officers and `partner_id` for Business Partners.
- **Role Control**: `user_roles` table dictates access permissions across the 4 application portals (`citizen`, `officer`, `partner`, `admin`).

---

## 💾 2. Disaster Recovery & Backup Procedures

### **2.1 PostgreSQL Point-in-Time Recovery (PITR)**
- **Daily WAL Backups**: Automatic WAL archiving enabled on Supabase PostgreSQL.
- **RPO (Recovery Point Objective)**: < 5 minutes.
- **RTO (Recovery Time Objective)**: < 15 minutes.

### **2.2 Manual Database Backup**
```bash
# Export pg_dump snapshot
pg_dump "postgres://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" \
  --schema=public --clean --if-exists -F c -f kindra_backup_v1.dump
```

### **2.3 Database Restoration Procedures**
```bash
# Restore PostgreSQL dump
pg_restore --clean --no-acl --no-owner -d "postgres://..." kindra_backup_v1.dump
```

---

## 🚨 3. Incident Response Protocol

| Severity | Definition | Target Resolution Time | Action Protocol |
|---|---|---|---|
| **P1 - Critical** | Whole site down, Auth failure, or DB unreachable | < 15 Minutes | Trigger emergency page to DevOps lead; switch DB fallback replica. |
| **P2 - High** | OpenRouter AI Vision API down | < 30 Minutes | Fallback model chain triggers automatically (`google/gemma-4-26b-a4b-it:free` → `meta-llama/llama-3.2-11b-vision-instruct:free` → Local Rule Engine). |
| **P3 - Medium** | Storage photo upload bottleneck | < 2 Hours | Clear Supabase Storage buffer, verify CDN caching headers. |
| **P4 - Low** | UI visual cosmetic bug | < 24 Hours | Queue non-urgent patch for standard CI/CD deployment. |

---

## 📊 4. System Observability & Health Probes

- **Database Probe**: `SELECT 1;` via Supabase client.
- **AI Engine Probe**: `askGemmaAssistant("healthcheck")` endpoint ping.
- **Edge Middleware Check**: Inspect HSTS & CSP headers via `curl -I https://kindra.app`.
