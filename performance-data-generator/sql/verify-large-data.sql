\set ON_ERROR_STOP on
\pset pager off

DO $$
BEGIN
    IF to_regclass('public.cmms_performance_test_run') IS NULL THEN
        RAISE EXCEPTION 'No performance-test registry exists. Generate a data run first.';
    END IF;
END $$;

CREATE TEMP TABLE perf_cfg AS
SELECT *
FROM cmms_performance_test_run
WHERE run_id = upper(:'run_id');

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM perf_cfg) THEN
        RAISE EXCEPTION 'Performance data run % was not found', upper(:'run_id');
    END IF;
END $$;

CREATE TEMP TABLE perf_count_check (
    dataset VARCHAR(40) PRIMARY KEY,
    expected_count BIGINT NOT NULL,
    actual_count BIGINT NOT NULL
);

INSERT INTO perf_count_check
SELECT 'sites', c.site_count,
       (SELECT count(*) FROM site_master s WHERE left(s.site_code, length(c.marker) + 2) = c.marker || '-S')
FROM perf_cfg c
UNION ALL
SELECT 'employees', c.employee_count,
       (SELECT count(*) FROM employee_master e WHERE left(e.employee_code, length(c.marker) + 2) = c.marker || '-E')
FROM perf_cfg c
UNION ALL
SELECT 'equipment', c.equipment_count,
       (SELECT count(*) FROM equipment_master e WHERE left(e.equipment_code, length(c.marker) + 2) = c.marker || '-Q')
FROM perf_cfg c
UNION ALL
SELECT 'maintenance_requests', c.request_count,
       (SELECT count(*) FROM maintenance_request r WHERE left(r.request_number, length(c.marker) + 2) = c.marker || '-R')
FROM perf_cfg c
UNION ALL
SELECT 'assignments', c.assignment_count,
       (SELECT count(*) FROM maintenance_assignment a
        JOIN maintenance_request r ON r.id = a.request_id
        WHERE left(r.request_number, length(c.marker) + 2) = c.marker || '-R')
FROM perf_cfg c
UNION ALL
SELECT 'work_logs', c.work_log_count,
       (SELECT count(*) FROM maintenance_assignment_work_log w
        JOIN maintenance_assignment a ON a.id = w.assignment_id
        JOIN maintenance_request r ON r.id = a.request_id
        WHERE left(r.request_number, length(c.marker) + 2) = c.marker || '-R')
FROM perf_cfg c
UNION ALL
SELECT 'downtime_records', c.downtime_count,
       (SELECT count(*) FROM equipment_downtime d WHERE left(coalesce(d.remarks, ''), length(c.marker)) = c.marker)
FROM perf_cfg c
UNION ALL
SELECT 'spare_transactions', c.spare_transaction_count,
       (SELECT count(*) FROM spare_part_transaction t WHERE t.reference_type = c.marker || '-BULK-LOAD')
FROM perf_cfg c
UNION ALL
SELECT 'spare_parts', c.spare_part_count,
       (SELECT count(*) FROM spare_part_master p WHERE left(p.part_code, length(c.marker) + 2) = c.marker || '-P')
FROM perf_cfg c
UNION ALL
SELECT 'site_stock_rows', c.site_count * c.spare_part_count,
       (SELECT count(*)
        FROM spare_part_site_stock st
        JOIN spare_part_master p ON p.spare_part_id = st.spare_part_id
        JOIN site_master s ON s.site_id = st.site_id
        WHERE left(p.part_code, length(c.marker) + 2) = c.marker || '-P'
          AND left(s.site_code, length(c.marker) + 2) = c.marker || '-S')
FROM perf_cfg c;

SELECT dataset, expected_count, actual_count,
       CASE WHEN expected_count = actual_count THEN 'PASS' ELSE 'FAIL' END AS result
FROM perf_count_check
ORDER BY dataset;

DO $$
DECLARE
    failures TEXT;
BEGIN
    SELECT string_agg(dataset || ': expected ' || expected_count || ', actual ' || actual_count, '; ')
    INTO failures
    FROM perf_count_check
    WHERE expected_count <> actual_count;

    IF failures IS NOT NULL THEN
        RAISE EXCEPTION 'Performance data verification failed: %', failures;
    END IF;
END $$;

\echo 'All performance data counts match the requested targets.'
