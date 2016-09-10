import xs, { Stream } from 'xstream';
import { DOMSource } from '@cycle/dom/xstream-typings';
import { VNode, a } from '@cycle/dom';
import isolate from '@cycle/isolate';

export interface ButtonSources {
  classes$: Stream<string>;
  content$: Stream<VNode[]|string>;
  dom: DOMSource;
}

export interface ButtonSinks {
  dom: Stream<VNode>;
  click$: Stream<MouseEvent>;
}

function ButtonComponent(sources: ButtonSources): ButtonSinks {
  const click$ = sources.dom.select('a').events('click').map(event => event as MouseEvent);
  const classes$ = sources.classes$;
  const content$ = sources.content$;
  const dom =
    xs.combine(classes$, content$)
      .map(([classes, content]) => a(classes, content));
  return {
    dom,
    click$
  };
}

const Button = (sources: ButtonSources) => isolate(ButtonComponent)(sources);

export default Button;
