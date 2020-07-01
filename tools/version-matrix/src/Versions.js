import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVersions } from './actions';
import { Card, CardContainer, CardHeader, CardKey, CardPair, CardStripe } from './styles';

const Versions = (props) => {
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
    }

    const versions = useSelector(state => state.versions);

    return (
        <CardContainer>
            {versions.map(({ name, version, builtAt, values }, i) => (
                <Card key={i}>
                    <CardHeader>{name}</CardHeader>
                    <CardStripe>
                        {version}
                    </CardStripe>
                    <CardPair>
                        <CardKey>Built at</CardKey> {builtAt}
                    </CardPair>

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

export default Versions;
