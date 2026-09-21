-- ============================================================================
-- TINYRIDE BY DODAIL — HYDERABAD PILOT SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PILOT SCHOOLS (Hyderabad Core Education Hubs)
-- ----------------------------------------------------------------------------

INSERT INTO public.schools (id, name, code, branch_name, address, latitude, longitude, contact_person, contact_phone, morning_bell_time, afternoon_bell_time, is_active)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Delhi Public School (DPS)',
    'DPS-GACHIBOWLI',
    'Gachibowli Campus',
    'Survey No. 74, Khajaguda Village, Golconda Post, Gachibowli, Hyderabad, Telangana 500008',
    17.4194,
    78.3688,
    'Transport Coordinator - Mr. Satyanarayana',
    '+919849012345',
    '08:15',
    '15:15',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Oakridge International School',
    'OAKRIDGE-GACHIBOWLI',
    'Einstein Campus',
    'Nanakramguda Road, Cyberabad, Khajaguda, Manikonda, Hyderabad, Telangana 500008',
    17.4116,
    78.3582,
    'Transport Desk - Ms. Radhika V',
    '+919849067890',
    '08:30',
    '15:30',
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'The Hyderabad Public School',
    'HPS-BEGUMPET',
    'Begumpet Heritage Campus',
    '1-11-87 & 88, S.P. Road, Begumpet, Hyderabad, Telangana 500016',
    17.4435,
    78.4728,
    'Admin Office - Mr. K. Rao',
    '+919849054321',
    '08:00',
    '14:45',
    true
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Glendale Academy International',
    'GLENDALE-SUNCITY',
    'Sun City Campus',
    'Beside Sun City, Artry Road, Bandlaguda Jagir, Hyderabad, Telangana 500086',
    17.3627,
    78.3972,
    'Safety & Fleet Lead - Mr. Imran Khan',
    '+919849098765',
    '08:20',
    '15:10',
    true
  )
ON CONFLICT (id) DO NOTHING;
