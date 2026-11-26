*PRODUCT PLANNING   /   26 NOVEMBER 2026*

# Production CMMS dashboard

### Market review and implementation roadmap

At shift handover, a supervisor needs to identify which assets are down, which jobs need a decision today, and who owns the next action. The recommended first release connects those questions to the maintenance records already in the application.

### First release decision

Build a live downtime board and clickable overdue and unassigned work queues. In the same release, make widget failures visible and remove received purchases from the open reorder queue. Pilot the result at one site before expanding it.

### How comparable CMMS products support the shift

### Fiix | Plan the work

The planning dashboard highlights overdue work, missing due dates, upcoming preventive maintenance (PM), and estimated hours. Its labor availability view helps planners find a day with capacity and open the work order to change the date or assignee. Adopt the path from an exception to the underlying job. [1, 2]

### IBM Maximo Manage | Supervise the work

Work Orders supports custom views. Workflow Assignments surfaces overdue assignments and supports decisions such as accepting, rejecting or reassigning work. A “Needs my decision” view can link to the CMMS approval and assignment pages. [3]

### Limble | Explain the downtime

Technicians record downtime against the asset. Managers can inspect the contributing tasks and records behind downtime reports. Give supervisors the same ability to distinguish one prolonged stoppage from several recurring failures. [4]

*Scope: recommendations from the application source and vendor documentation. Production traffic measurements and user interviews were outside this review.*

*01   /   EXISTING DASHBOARD*

## Four changes to make first

### 1. Distinguish an empty queue from a failed request

The page catches individual widget errors and discards their results. An unavailable My Jobs or Low Stock API can therefore look like a queue with no work. The backend already returns generatedAt and refreshSeconds. [5, 9]

Show loading, current, stale, empty and error states per widget. On a failed refresh, keep the previous value with its timestamp, provided the site and user scope still match. Provide a retry on that widget. Healthy cards should stay usable.

### 2. Open the records counted by each card

Critical, overdue and unassigned requests already have counts. The page renders them as display cards. The My Jobs widget points to the general assignments route even though the app has a dedicated My Assignments page. [5, 6]

Open a filtered list from each count, preserve the selected site and status, and open each row in View. Route My Jobs to My Assignments. Keep View, Update and site permissions in force at every destination.

### 3. Remove received purchases from open reorders

The dashboard uses a generic closed-status filter that omits RECEIVED. Its open reorder queue takes up to eight records without a priority sort. A received purchase can occupy a place needed by an overdue receipt. [7]

Use reorder-specific open states and sort by blocked active work, expected receipt date and a stable tie-breaker. Verify that receipt removes the purchase from the open queue and that its history remains available.

### 4. Give vendor performance a precise meaning

The service divides completed assignments by all included assignments and ranks vendors by completed count. New assignments can lower the displayed percentage immediately. The frontend shortens names to four characters. [5, 8]

Label the existing measure “Assignment completion rate,” show completed and total jobs, and display recognizable names. Add on-time completion against an agreed due date. Introduce contract SLA compliance once the target, start event, stop event and exclusions are recorded.

*02   /   FEATURE BACKLOG*

## Six features, in delivery order

### 1. Live downtime board  |  High data readiness

Show open incidents by site, production line and asset criticality, with start time, elapsed duration, recorded reason, owner if known, and a link to the request. Put critical stopped equipment first. Show estimated production loss only when the input rate and units are available. Existing incident records include start/end, shift, line, reason and loss fields. [10]

### 2. Supervisor work queue  |  High

Surface critical unassigned requests, overdue jobs, jobs waiting on parts, pending approvals and completed work awaiting closure. Show age, owner and next action. Link assignments to the parent request and explicitly label whether a count measures jobs or incidents.

### 3. PM due and on-time compliance  |  Mixed

Show overdue, due today and due in the next seven days. The current 30-day widget looks ahead and compares completed work with generated work. Preserve an original due date per expected occurrence so a missed generation or a reschedule remains visible. Drill into the specific missed occurrences. [8]

### 4. Parts blocking active work  |  High

Connect each shortage to the maintenance job and asset. Show required, reserved and available quantities, linked purchase, and expected receipt. Use the existing spare-request workflow to distinguish a below-minimum item from a shortage stopping a repair.

### 5. Asset reliability and impact  |  High for incident measures

Rank assets by unplanned downtime, incident count and recorded loss. Link each total to the incidents and causes. Add mean time between failures once operating hours and qualifying failure events are reliable. Separate elapsed time to restore production from hands-on repair time.

### 6. Technician workload and capacity  |  Partial

Use assignment dates now to show jobs per technician and overlapping commitments. For capacity in hours, collect estimated labor hours, shift calendars and absences. The assignment model already holds planned and actual dates and costs. [11]

*03   /   RELEASE DESIGN*

## The shift handover experience

### Supervisor

Keep the site selector and department tabs. Lead with four clickable figures: assets down now, critical unassigned requests, overdue jobs, and jobs blocked by parts. Place the ranked work queue below them. Keep historical trends available after the immediate decisions.

### Technician

Open on the technician’s own jobs due today. Each row should identify the asset, location, due date and next permitted action. Preserve the selected site and technician identity when opening the job.

### Storekeeper

Lead with shortages affecting active jobs. Selecting a shortage opens its spare request, where the storekeeper can check availability, reserve stock or follow the linked purchase under existing permissions.

### Production acceptance checks

### Counts and drill-down agree

With seven overdue Site A jobs, selecting the card opens exactly those seven for the same reporting time and permission scope. Jobs with no target date appear under Missing due date. Changing site clears the prior site’s results.

### Time and freshness are explicit

Label live values “Now” and label historical values with the reporting period and site business timezone. Split incident duration at shift and reporting boundaries. A failed first load shows unavailable. A failed refresh shows the last successful timestamp.

### Large sites remain usable

Several queues load scoped collections, filter and sort in Java, then take eight rows. Move filtering, ordering and limits into database queries. Measure response times with representative large-site and all-site data, including concurrent users. Agree latency targets from that baseline. [7]

*Pilot question: Can a shift supervisor identify the most urgent stopped asset, find its owner and open the correct job during handover? Record time taken, missing fields and any mismatches before extending the rollout.*

*04   /   REFERENCE*

## Metric definitions and sources

### Suggested KPI definitions for sign-off

Assets down now: count distinct assets with an unresolved downtime interval at the reporting instant. Overdue jobs: count eligible unfinished jobs whose target has passed. State the counted entity, terminal statuses, time zone and snapshot time.

PM on-time compliance: on-time completions divided by eligible PM occurrences due in the period. Agree cancellation and deferral rules, preserve original due dates, and show numerator and denominator. If no occurrence qualifies, display “No PM due.”

Jobs blocked by parts: count distinct active jobs with a confirmed material shortage preventing work. Document which spare-request states qualify. Preserve links to every shortage when a job is waiting on multiple parts.

### Market references

1. [Fiix · Work order planning dashboard](https://helpdesk.fiixsoftware.com/hc/en-us/articles/16532330050452-Work-order-planning-dashboard)

2. [Fiix · Labor availability dashboard](https://helpdesk.fiixsoftware.com/hc/en-us/articles/41508753714836-Labor-availability-dashboard)

3. [IBM · Maximo Manage work orders and workflow assignments](https://www.ibm.com/docs/en/masv-and-l/maximo-manage/cd?topic=manage-in-85)

4. [Limble · Tracking downtime](https://help.limblecmms.com/en/articles/3006463-tracking-downtime)

### Application references

5. [Dashboard page · loading, card rendering and vendor labels](https://github.com/DarshankbAndri/workspace/blob/8442dee91daab78265b317ef113295b098b592a5/cmms_front_end/src/features/dashboard/pages/DashboardPage.jsx#L214)

6. [Dashboard service · widget destinations and site scoping](https://github.com/DarshankbAndri/workspace/blob/8442dee91daab78265b317ef113295b098b592a5/cmms_back_end/src/main/java/com/example/cmmsApplication/dashboard/implementation/DashboardServiceImpl.java#L234)

7. [Dashboard service · assignment, stock and reorder queues](https://github.com/DarshankbAndri/workspace/blob/8442dee91daab78265b317ef113295b098b592a5/cmms_back_end/src/main/java/com/example/cmmsApplication/dashboard/implementation/DashboardServiceImpl.java#L505)

8. [Dashboard service · vendor performance and upcoming PM](https://github.com/DarshankbAndri/workspace/blob/8442dee91daab78265b317ef113295b098b592a5/cmms_back_end/src/main/java/com/example/cmmsApplication/dashboard/implementation/DashboardServiceImpl.java#L643)

9. [Widget response · actions, refresh interval and generation time](https://github.com/DarshankbAndri/workspace/blob/8442dee91daab78265b317ef113295b098b592a5/cmms_back_end/src/main/java/com/example/cmmsApplication/dashboard/dto/DashboardWidgetResponseDTO.java#L23)

10. [Equipment downtime · incident, production line and loss fields](https://github.com/DarshankbAndri/workspace/blob/8442dee91daab78265b317ef113295b098b592a5/cmms_back_end/src/main/java/com/example/cmmsApplication/downtime/entity/EquipmentDowntime.java#L42)

11. [Maintenance assignment · planned dates and costs](https://github.com/DarshankbAndri/workspace/blob/8442dee91daab78265b317ef113295b098b592a5/cmms_back_end/src/main/java/com/example/cmmsApplication/assignment/entity/MaintenanceAssignment.java#L46)
