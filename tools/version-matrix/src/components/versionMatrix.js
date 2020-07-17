import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVersions } from '../actions';
import { Card, CardContainer, CardHeader, CardKey, CardPair, CardBadge, CardSubtext, Divider, ServicePair } from '../styles';

const VersionMatrix = (props) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchVersions());
    }, [dispatch]);

    const renderValue = (value) => {
        if (Boolean(['http://', 'https://'].some(protocol => value.value.startsWith(protocol)))) {
            return <a href={value.value} target="_blank" rel="noopener noreferrer">Open</a>;
        } else {
            return value.value;
        }
    };

    const versions = useSelector(state => state.versions);

    return (
        <CardContainer>
            {versions.envs.map(({ name, version, builtAt, values }, i) => (
                <Card key={i}>
                    <CardHeader>{name}</CardHeader>
                    <CardBadge>
                        {version}
                    </CardBadge>
                    <Divider>Built at {builtAt}</Divider>

                    {versions.services[name] && versions.services[name].map((service, i) => (
                        <ServicePair key={i}>
                            <div>
                                {service.name}
                                <CardSubtext>
                                    {service.builtAt}
                                </CardSubtext>
                            </div>

                            <CardBadge smaller>{service.version}</CardBadge>
                        </ServicePair>
                    ))}

                    {values.map((value, i) => (
                        <CardPair key={i}>
                            <CardKey>{value.label}</CardKey> {renderValue(value)}
                        </CardPair>
                    ))}
                </Card>
            ))}
        </CardContainer>
    );
};

export default VersionMatrix;
