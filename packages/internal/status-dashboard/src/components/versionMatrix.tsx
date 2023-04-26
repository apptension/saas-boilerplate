import React from 'react';
import { useFetchVersions } from '../hooks/useFetchVersions';

import {
  Card,
  CardBadge,
  CardContainer,
  CardHeader,
  CardService,
  Divider,
} from '../styles';
import ValueList from './valueList';

const VersionMatrix = () => {
  const { versions } = useFetchVersions();

  const forcedServiceOrder = ['webapp', 'api', 'workers', 'migrations'];

  return (
    <CardContainer>
      {versions.envs.map(({ name: envName, version, builtAt, values }, i) => (
        <Card key={i}>
          <CardHeader>{envName}</CardHeader>
          <CardBadge>{version}</CardBadge>
          <Divider>Built at {builtAt}</Divider>

          {versions.services[envName] &&
            Object.keys(versions.services[envName])
              .sort((a, b) => {
                return (
                  forcedServiceOrder.indexOf(a) - forcedServiceOrder.indexOf(b)
                );
              })
              .map((serviceName, i) => {
                const service = versions.services[envName][serviceName];
                return (
                  <CardService key={i}>
                    <div>
                      <strong>{service.name}</strong>
                    </div>

                    <CardBadge smaller dark={service.version === version}>
                      {service.version}
                    </CardBadge>

                    <div>{service.builtAt}</div>

                    <ValueList items={service.values} />
                  </CardService>
                );
              })}

          <Divider />
          <ValueList items={values} />
        </Card>
      ))}
    </CardContainer>
  );
};

export default VersionMatrix;
