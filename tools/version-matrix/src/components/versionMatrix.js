import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVersions } from '../actions';
import { Card, CardBadge, CardContainer, CardHeader, CardService, Divider } from '../styles';
import ValueList from './valueList';

const VersionMatrix = (props) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchVersions());
    }, [dispatch]); 

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
                    ))}

                    <Divider />
                    <ValueList items={values} />
                </Card>
            ))}
        </CardContainer>
    );
};

export default VersionMatrix;
