Main production bottleneck found:
 /dashboard/widgets/maintenance/open-requests took about 26.1s. The cause is in
  [DashboardService.java (line 471)](C:/Users/production/Documents/Sof_projects/workspace/cmms_back_end/src/main/java/com/example/cmmsApplication/dashboard/service/DashboardService.java:471):
   it loads all maintenance requests into Java, then does per-request assignment 
   lookups at [line 480 (line 480)](C:/Users/production/Documents/Sof_projects/workspace/cmms_back_end/src/main/java/com/example/cmmsApplication/dashboard/service/DashboardService.java:480). 
   That should become database aggregate queries, with supporting composite indexes.