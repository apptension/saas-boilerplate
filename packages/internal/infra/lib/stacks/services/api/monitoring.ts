import {
  Dashboard,
  GraphWidget,
  GraphWidgetView,
  Metric,
  Unit,
} from "aws-cdk-lib/aws-cloudwatch";
import { FilterPattern, ILogGroup, MetricFilter } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { EnvConstructProps } from "../../../types";
import { MainDatabase } from "../../env/db/mainDatabase";
import { MainECSCluster } from "../../env/main/mainEcsCluster";
import { ApiStack } from "./stack";

export interface CustomDashboardProps extends EnvConstructProps {
  logGroup?: ILogGroup;
}

export class Monitoring extends Construct {
  dashboard: Dashboard;

  constructor(scope: Construct, id: string, props: CustomDashboardProps) {
    super(scope, id);

    this.dashboard = this.createDashboard(props);
  }

  private createDashboard(props: CustomDashboardProps) {
    const dashboard = new Dashboard(this, "ApiDashboard", {
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

  private ecsUtilizationWidget(props: CustomDashboardProps): GraphWidget {
    const ecsCPUUtilizationMetric = new Metric({
      namespace: "AWS/ECS",
      metricName: "MemoryUtilization",
      statistic: "Average",
      unit: Unit.PERCENT,
      dimensionsMap: {
        ClusterName: MainECSCluster.getClusterName(props.envSettings),
        ServiceName: ApiStack.getServiceName(props.envSettings),
      },
    });

    const ecsMemoryUtilizationMetric = new Metric({
      namespace: "AWS/ECS",
      metricName: "CPUUtilization",
      statistic: "Average",
      unit: Unit.PERCENT,
      dimensionsMap: {
        ClusterName: MainECSCluster.getClusterName(props.envSettings),
        ServiceName: ApiStack.getServiceName(props.envSettings),
      },
    });

    return new GraphWidget({
      title: "ECS CPU and memory utilization",
      left: [ecsCPUUtilizationMetric, ecsMemoryUtilizationMetric],
    });
  }

  private rdsUtilizationWidget(props: CustomDashboardProps): GraphWidget {
    const rdsCPUUtilizationMetric = new Metric({
      namespace: "AWS/RDS",
      metricName: "CPUUtilization",
      statistic: "Average",
      unit: Unit.PERCENT,
      dimensionsMap: {
        DBInstanceIdentifier: MainDatabase.getInstanceIdentifier(
          props.envSettings
        ),
      },
    });

    const rdsDbConnectionsMetric = new Metric({
      namespace: "AWS/RDS",
      metricName: "DatabaseConnections",
      statistic: "Average",
      unit: Unit.COUNT,
      dimensionsMap: {
        DBInstanceIdentifier: MainDatabase.getInstanceIdentifier(
          props.envSettings
        ),
      },
    });

    return new GraphWidget({
      title: "RDS CPU utilization and no. of connections",
      left: [rdsCPUUtilizationMetric],
      right: [rdsDbConnectionsMetric],
    });
  }

  private apiStatusCodesWidget(props: CustomDashboardProps): GraphWidget {
    new MetricFilter(this, "HTTP2xxResponses", {
      logGroup: <ILogGroup>props.logGroup,
      filterPattern: FilterPattern.literal(
        "[ip, id, user, timestamp, request, status_code=2*, size]"
      ),
      metricName: "HTTP2xxResponses",
      metricNamespace: "APINamespace",
      defaultValue: 0,
    });

    const successfulRequestsMetric = new Metric({
      namespace: "APINamespace",
      metricName: "HTTP2xxResponses",
      statistic: "Sum",
      unit: Unit.COUNT,
    });

    new MetricFilter(this, "HTTP4xxResponses", {
      logGroup: <ILogGroup>props.logGroup,
      filterPattern: FilterPattern.literal(
        "[ip, id, user, timestamp, request, status_code=4*, size]"
      ),
      metricName: "HTTP4xxResponses",
      metricNamespace: "APINamespace",
      defaultValue: 0,
    });

    const clientErrorsMetric = new Metric({
      namespace: "APINamespace",
      metricName: "HTTP4xxResponses",
      statistic: "Sum",
      unit: Unit.COUNT,
    });

    new MetricFilter(this, "HTTP5xxResponses", {
      logGroup: <ILogGroup>props.logGroup,
      filterPattern: FilterPattern.literal(
        "[ip, id, user, timestamp, request, status_code=5*, size]"
      ),
      metricName: "HTTP5xxResponses",
      metricNamespace: "APINamespace",
      defaultValue: 0,
    });

    const serverErrorsMetric = new Metric({
      namespace: "APINamespace",
      metricName: "HTTP5xxResponses",
      statistic: "Sum",
      unit: Unit.COUNT,
    });

    return new GraphWidget({
      title: "Summary of API status codes",
      left: [successfulRequestsMetric, clientErrorsMetric, serverErrorsMetric],
      view: GraphWidgetView.PIE,
    });
  }
}
