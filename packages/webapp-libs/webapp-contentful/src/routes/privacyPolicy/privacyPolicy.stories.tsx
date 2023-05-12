import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { append } from 'ramda';

import { appConfigFactory, fillContentfulAppConfigQuery } from '../../tests/factories';
import { withProviders } from '../../utils/storybook';
import { PrivacyPolicy } from './privacyPolicy.component';

const requestMock = fillContentfulAppConfigQuery({
  items: [
    appConfigFactory({
      privacyPolicy: `
# Privacy policy

## Est in sacras miracula movere aether ensem

Lorem markdownum ipse silvae, quo [natus
capillos](http://ergovenus.net/agrostot) namque heros contagia Timoli. Opto
carent te est *nequeam* vulgi extrema, speculo manu! Humana undis esse?

1. Poscit et iustamque adfuit Thisbe est latentia
2. Tenet sed famulis artes hoc iuvenem arbore
3. Procorum laevaque pater
4. Que petit in superos levatae

## Turba forsitan scilicet rapitur eget ut similis

Et nares fortibus! **Danda pectore** Sisyphio, tamen silva addunt nostri hinc
**consistere** vota: adversa opes [teneris ardor](http://prius-ipsumque.org/),
oraque, est. **Ille sum utque** litus deus, conpagibus videres. Saxo aura
Sarpedonis inque, alveus et.

- Tangunt reliquerat pietate simul
- Latus terra
- Auro erat erat fallacia corpora
- Si sibila animae et intrare sortemque socerumque

## Aurum est excepit mensas

Solacia relicta in radiantia iamque, ira Aegyptia pater. Deo cum irascitur,
memorque pinus, claro Liber, omnia lacus munere.

1. Et ossa arboris superator ipse mutata intravit
2. Potentum tenet
3. Vicina ubi cadunt iuvenis ad apes fata
4. Vos hanc dedecus
5. Tibi miracula orbe cognitus fieri praecordiaque et

## Corpora dant

Metuenti post omnibus antra, utinamque de frigidus nunc parvumque temptat **in**
utraque ferarum. *Cuspide magna* mihi Lucifer exitus, tumidaque cum cedemus
tempore inguina deseret pectora profers; superbia et dicta sua. Precari
speciosam multaque cupidine alios persequerer compos Lapithae his oborto frena
deprenduntur auram tenebrisque. Orbem ego pectora lingua ultra traduxit meo
pulsavere ferre, animal. Ibi pectora texerat precor, facta hunc *adunca aetas*
obsita, se stant digiti, me unde.

1. Summis gratentur iactavit a decidit tyranni secutus
2. Quibus saepe polluit dea Phocus capillis cristati
3. Sed quem aequora
4. Rediit fluctus sed peccare Erycina cuperem ferrum
5. Nescit de monte gramen incaluit prosilit

Canescunt candescere favet tum glandes queri audierat caespite medios; aquae
magis *prius* in trahunt, ut. Onus volumine et mitte fornace **in** iterant
obusta cum Oribasos armorum et tulit **nec** aegre fuisses materno, **luna**.
Cum huc palantesque tamen desiluit inexperrectus, toto, patitur!
    `,
    }),
  ],
  limit: 1,
  skip: 0,
  total: 1,
});

const Template: StoryFn = () => {
  return <PrivacyPolicy />;
};
const meta: Meta = {
  title: 'Routes/PrivacyPolicy',
  component: PrivacyPolicy,
  decorators: [withProviders({ apolloMocks: append(requestMock) })],
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
};
