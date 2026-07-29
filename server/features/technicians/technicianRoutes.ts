import { Router } from 'express';
import type { QueryResultRow } from 'pg';
import type { Technician } from '../../../shared/domain';
import { pool } from '../../db/pool';

interface TechnicianRow extends QueryResultRow {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  active: boolean;
  skill_tags: string[];
}

export const technicianRoutes = Router();

technicianRoutes.get('/', async (_request, response) => {
  const result = await pool.query<TechnicianRow>(
    `SELECT id, user_id, name, phone, active, skill_tags
     FROM technicians
     WHERE active = true
     ORDER BY name, id`,
  );
  const technicians: Technician[] = result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id ?? '',
    name: row.name,
    phone: row.phone,
    active: row.active,
    skillTags: row.skill_tags,
  }));
  response.json({ data: technicians });
});
