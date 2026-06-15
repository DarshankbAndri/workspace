-- Dummy SUPER_ADMIN employee + login user + global SUPER_ADMIN assignment

WITH new_employee AS (
    INSERT INTO employee_master (
        employee_code,
        first_name,
        last_name,
        mobile_number,
        email,
        gender,
        date_of_birth,
        date_of_joining,
        designation,
        department,
        status,
        created_at,
        updated_at
    )
    VALUES (
        'EMP-SUPER-001',
        'Super',
        'Admin',
        '9999999999',
        'superadmin@example.com',
        'OTHER',
        '1990-01-01',
        CURRENT_DATE,
        'System Administrator',
        'Administration',
        'ACTIVE',
        NOW(),
        NOW()
    )
    ON CONFLICT (employee_code) DO UPDATE
    SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        mobile_number = EXCLUDED.mobile_number,
        email = EXCLUDED.email,
        designation = EXCLUDED.designation,
        department = EXCLUDED.department,
        status = 'ACTIVE',
        updated_at = NOW()
    RETURNING employee_id
),
new_user AS (
    INSERT INTO users (
        username,
        email,
        password,
        first_name,
        last_name,
        role,
        department,
        employee_id,
        active,
        created_at,
        updated_at
    )
    SELECT
        'superadmin',
        'superadmin@example.com',
        '$2a$10$pzm/TDsZuRtX1l3We1sYoelILNwaQC7foIyDn/HzKWAGusVZtaDc.',
        'Super',
        'Admin',
        'ADMIN',
        'Administration',
        employee_id,
        true,
        NOW(),
        NOW()
    FROM new_employee
    ON CONFLICT (username) DO UPDATE
    SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = 'ADMIN',
        department = EXCLUDED.department,
        employee_id = EXCLUDED.employee_id,
        active = true,
        updated_at = NOW()
    RETURNING id
)
INSERT INTO user_role (
    user_id,
    role_id,
    site_id,
    status,
    created_at,
    updated_at
)
SELECT
    new_user.id,
    role_master.role_id,
    NULL,
    'ACTIVE',
    NOW(),
    NOW()
FROM new_user
JOIN role_master ON role_master.role_code = 'SUPER_ADMIN'
WHERE NOT EXISTS (
    SELECT 1
    FROM user_role ur
    WHERE ur.user_id = new_user.id
      AND ur.role_id = role_master.role_id
      AND ur.site_id IS NULL
);