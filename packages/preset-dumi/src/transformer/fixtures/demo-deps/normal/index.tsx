import yaml from 'js-yaml';
import normal from './normal';

export default () => (
  <>
    <h1>{typeof yaml}</h1>
    <p>{normal}</p>
  </>
)