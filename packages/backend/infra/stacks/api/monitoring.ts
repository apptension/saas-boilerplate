import { Construct } from 'constructs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';
import { EnvConstructProps } from '@sb/infra-core';
import {
  MainDatabase,
  MainECSCluster,
} from '@sb/infra-shared';

import { getApiServiceName } from './names';

export interface CustomDashboardProps extends EnvConstructProps {
  logGroup?: logs.ILogGroup;
}

export class Monitoring extends Construct {
  dashboard: cloudwatch.Dashboard;

  constructor(scope: Construct, id: string, props: CustomDashboardProps) {
    super(scope, id);

    this.dashboard = this.createDashboard(props);
  }

  private createDashboard(props: CustomDashboardProps) {
    const dashboard = new cloudwatch.Dashboard(this, 'ApiDashboard', {
      dashboardName: `${props.envSettings.projectName}-${props.envSettings.envStage}-ApiDashboard`,
      widgets: [
        [this.ecsUtilizationWidget(props), this.rdsUtilizationWidget(props)],
      ],
    });
    if (props.logGroup) {
      dashboard.addWidgets(this.apiStatusCodesWidget(props));
    }
    return dashboard;
  }

  private ecsUtilizationWidget(
    props: CustomDashboardProps
  ): cloudwatch.GraphWidget {
    const ecsCPUUtilizationMetric = new cloudwatch.Metric({
      namespace: 'AWS/ECS',
      metricName: 'MemoryUtilization',
      statistic: 'Average',
      unit: cloudwatch.Unit.PERCENT,
      dimensionsMap: {
        ClusterName: MainECSCluster.getClusterName(props.envSettings),
        ServiceName: getApiServiceName(props.envSettings),
      },
    });

    const ecsMemoryUtilizationMetric = new cloudwatch.Metric({
      namespace: 'AWS/ECS',
      metricName: 'CPUUtilization',
      statistic: 'Average',
      unit: cloudwatch.Unit.PERCENT,
      dimensionsMap: {
        ClusterName: MainECSCluster.getClusterName(props.envSettings),
        ServiceName: getApiServiceName(props.envSettings),
      },
    });

    return new cloudwatch.GraphWidget({
      title: 'ECS CPU and memory utilization',
      left: [ecsCPUUtilizationMetric, ecsMemoryUtilizationMetric],
    });
  }

  private rdsUtilizationWidget(
    props: CustomDashboardProps
  ): cloudwatch.GraphWidget {
    const rdsCPUUtilizationMetric = new cloudwatch.Metric({
      namespace: 'AWS/RDS',
      metricName: 'CPUUtilization',
      statistic: 'Average',
      unit: cloudwatch.Unit.PERCENT,
      dimensionsMap: {
        DBInstanceIdentifier: MainDatabase.getInstanceIdentifier(
          props.envSettings
        ),
      },
    });

    const rdsDbConnectionsMetric = new cloudwatch.Metric({
      namespace: 'AWS/RDS',
      metricName: 'DatabaseConnections',
      statistic: 'Average',
      unit: cloudwatch.Unit.COUNT,
      dimensionsMap: {
        DBInstanceIdentifier: MainDatabase.getInstanceIdentifier(
          props.envSettings
        ),
      },
    });

    return new cloudwatch.GraphWidget({
      title: 'RDS CPU utilization and no. of connections',
      left: [rdsCPUUtilizationMetric],
      right: [rdsDbConnectionsMetric],
    });
  }

  private apiStatusCodesWidget(
    props: CustomDashboardProps
  ): cloudwatch.GraphWidget {
    new logs.MetricFilter(this, 'HTTP2xxResponses', {
      logGroup: <logs.ILogGroup>props.logGroup,
      filterPattern: logs.FilterPattern.literal(
        '[ip, id, user, timestamp, request, status_code=2*, size]'
      ),
      metricName: 'HTTP2xxResponses',
      metricNamespace: 'APINamespace',
      defaultValue: 0,
    });

    const successfulRequestsMetric = new cloudwatch.Metric({
      namespace: 'APINamespace',
      metricName: 'HTTP2xxResponses',
      statistic: 'Sum',
      unit: cloudwatch.Unit.COUNT,
    });

    new logs.MetricFilter(this, 'HTTP4xxResponses', {
      logGroup: <logs.ILogGroup>props.logGroup,
      filterPattern: logs.FilterPattern.literal(
        '[ip, id, user, timestamp, request, status_code=4*, size]'
      ),
      metricName: 'HTTP4xxResponses',
      metricNamespace: 'APINamespace',
      defaultValue: 0,
    });

    const clientErrorsMetric = new cloudwatch.Metric({
      namespace: 'APINamespace',
      metricName: 'HTTP4xxResponses',
      statistic: 'Sum',
      unit: cloudwatch.Unit.COUNT,
    });

    new logs.MetricFilter(this, 'HTTP5xxResponses', {
      logGroup: <logs.ILogGroup>props.logGroup,
      filterPattern: logs.FilterPattern.literal(
        '[ip, id, user, timestamp, request, status_code=5*, size]'
      ),
      metricName: 'HTTP5xxResponses',
      metricNamespace: 'APINamespace',
      defaultValue: 0,
    });

    const serverErrorsMetric = new cloudwatch.Metric({
      namespace: 'APINamespace',
      metricName: 'HTTP5xxResponses',
      statistic: 'Sum',
      unit: cloudwatch.Unit.COUNT,
    });

    return new cloudwatch.GraphWidget({
      title: 'Summary of API status codes',
      left: [successfulRequestsMetric, clientErrorsMetric, serverErrorsMetric],
      view: cloudwatch.GraphWidgetView.PIE,
    });
  }
}
