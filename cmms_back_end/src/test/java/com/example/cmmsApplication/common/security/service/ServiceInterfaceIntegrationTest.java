package com.example.cmmsApplication.common.security.service;

import com.example.cmmsApplication.admin.implementation.PermissionServiceImpl;
import com.example.cmmsApplication.common.security.implementation.ApiPermissionServiceImpl;
import com.example.cmmsApplication.notification.implementation.NotificationSchedulerServiceImpl;
import com.example.cmmsApplication.notification.implementation.NotificationStreamServiceImpl;
import com.example.cmmsApplication.admin.dao.PermissionDAO;
import com.example.cmmsApplication.admin.service.PermissionService;
import com.example.cmmsApplication.common.config.CmmsSecurityProperties;
import com.example.cmmsApplication.common.config.CmmsTimeProperties;
import com.example.cmmsApplication.common.security.repository.PermissionApiMappingRepository;
import com.example.cmmsApplication.notification.dto.NotificationSettingDTO;
import com.example.cmmsApplication.notification.service.NotificationScanService;
import com.example.cmmsApplication.notification.service.NotificationSchedulerService;
import com.example.cmmsApplication.notification.service.NotificationSettingsService;
import com.example.cmmsApplication.notification.service.NotificationStreamService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.aop.support.AopUtils;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.context.expression.BeanFactoryResolver;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.ScheduledAnnotationBeanPostProcessor;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.support.SimpleTransactionStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

class ServiceInterfaceIntegrationTest {
    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(ServiceConfiguration.class);

    @Test
    void interfacesKeepNamedBeanLookupAndReadOnlyTransactions() {
        contextRunner.run(context -> {
            PermissionDAO dao = context.getBean(PermissionDAO.class);
            when(dao.findAll()).thenReturn(List.of());
            PermissionService service = context.getBean(PermissionService.class);

            assertThat(context.getBean("permissionService")).isSameAs(service);
            assertThat(AopUtils.isJdkDynamicProxy(service)).isTrue();
            assertThat(service.getAll()).isEmpty();
            verify(context.getBean(PlatformTransactionManager.class))
                    .getTransaction(argThat(definition -> definition.isReadOnly()));
        });
    }

    @Test
    void permissionChecksRemainCachedThroughInterfaceAndBeanExpressions() {
        contextRunner.run(context -> {
            PermissionApiMappingRepository repository = context.getBean(PermissionApiMappingRepository.class);
            when(repository.countUserPermissionsForApiPath(7L, "/api/equipment", "GET")).thenReturn(1);
            ApiPermissionService service = context.getBean(ApiPermissionService.class);
            assertThat(context.getBean("apiPermissionService")).isSameAs(service);

            assertThat(service.hasPermission("7", "/api/equipment", "GET")).isTrue();
            StandardEvaluationContext evaluationContext = new StandardEvaluationContext();
            evaluationContext.setBeanResolver(new BeanFactoryResolver(context));
            Boolean allowed = new SpelExpressionParser()
                    .parseExpression("@apiPermissionService.hasPermission('7', '/api/equipment', 'GET')")
                    .getValue(evaluationContext, Boolean.class);
            assertThat(allowed).isTrue();
            verify(repository, times(1)).countUserPermissionsForApiPath(7L, "/api/equipment", "GET");
        });
    }

    @Test
    void scheduledMethodsAndSchedulingConfigurerAreStillDiscovered() {
        contextRunner.run(context -> {
            NotificationSchedulerService scheduler = context.getBean(NotificationSchedulerService.class);
            assertThat(scheduler).isInstanceOf(SchedulingConfigurer.class);
            assertThat(context.getBean("notificationSchedulerService")).isSameAs(scheduler);
            assertThat(context.getBean("notificationStreamService"))
                    .isSameAs(context.getBean(NotificationStreamService.class));
            assertThat(context.getBean(ScheduledAnnotationBeanPostProcessor.class).getScheduledTasks())
                    .hasSize(2);
        });
    }

    @Configuration(proxyBeanMethods = false)
    @EnableTransactionManagement(proxyTargetClass = false)
    @EnableCaching(proxyTargetClass = false)
    @EnableScheduling
    @Import({PermissionServiceImpl.class, ApiPermissionServiceImpl.class,
            NotificationSchedulerServiceImpl.class, NotificationStreamServiceImpl.class})
    static class ServiceConfiguration {
        @Bean PermissionDAO permissionDAO() { return mock(PermissionDAO.class); }
        @Bean PermissionApiMappingRepository permissionApiMappingRepository() {
            return mock(PermissionApiMappingRepository.class);
        }
        @Bean CmmsSecurityProperties securityProperties() {
            CmmsSecurityProperties properties = new CmmsSecurityProperties();
            properties.setApiPermissionRestrictionEnabled(true);
            return properties;
        }
        @Bean PublicApiPatternService publicApiPatternService() { return mock(PublicApiPatternService.class); }
        @Bean CacheManager cacheManager() { return new ConcurrentMapCacheManager("api-permissions"); }
        @Bean PlatformTransactionManager transactionManager() {
            PlatformTransactionManager manager = mock(PlatformTransactionManager.class);
            when(manager.getTransaction(any())).thenAnswer(invocation -> new SimpleTransactionStatus());
            return manager;
        }
        @Bean NotificationSettingsService notificationSettingsService() {
            NotificationSettingsService service = mock(NotificationSettingsService.class);
            NotificationSettingDTO settings = new NotificationSettingDTO();
            settings.setScanCron("0 0 7 * * *");
            when(service.getRuntimeSettings()).thenReturn(settings);
            return service;
        }
        @Bean NotificationScanService notificationScanService() { return mock(NotificationScanService.class); }
        @Bean CmmsTimeProperties timeProperties() { return new CmmsTimeProperties(); }
    }
}
