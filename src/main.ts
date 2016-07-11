import intent from './intent';
import model from './model';
import view from './view';
import { ISources, ISinks } from './definitions';

function main(sources: ISources): ISinks {
  return view(model(intent(sources)));
}

export default main;