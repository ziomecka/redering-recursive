import {
  AppendChild,
  CreateElement,
  CustomDocument,
  CustomDocumentFragment,
  CustomHTMLCollection,
  CustomHTMLElementProps,
} from '../types/';
import { concatTexts } from '../utils/concat-texts';
import { isSvg } from '../utils/is-svg';

const buildAppendChild = (
  document: CustomDocument,
  createElement: CreateElement,
): AppendChild => {
  const appendChild = (
    {
      children,
      HTMLTag,
      value,
      label,
      ...otherProps
    }: CustomHTMLElementProps = {},
    documentFragment?: CustomDocumentFragment,
  ): CustomDocumentFragment => {
    const fragment = documentFragment || document.createDocumentFragment();

    const append = (
      ($parent: CustomDocumentFragment): CustomDocumentFragment => {
        if (HTMLTag) {
          $parent.append(
            createElement({ HTMLTag, value, label, ...otherProps })
          );
        } else if (value || label) {
          $parent.append(
            document.createTextNode(concatTexts(value, label))
          );
        } else if (otherProps[0]) {
          $parent.append((otherProps as CustomHTMLCollection)[0]);
        }

        return $parent;
      }
    );

    if (!children || !children.length) {
      return append(fragment);
    }

    const $element = HTMLTag
      ? createElement({ HTMLTag, value, label, ...otherProps })
      : null;
    const $fragment = document.createDocumentFragment();
    const $parent = $element || $fragment;

    children.forEach($child => {
      if (typeof $child === 'string') {
        if (isSvg($child)) {
          if ($element) {
            $element.innerHTML = $child;
          } else {
            console.warn('SVG element can be child only of HTMLElement'); // eslint-disable-line
          }
        } else {
          $parent.append(document.createTextNode($child));
        }
      } else if ($child) {
        appendChild($child, $fragment);
      }
    });

    if ($element) {
      $element.append($fragment);
      fragment.append($element);
    } else {
      fragment.append($fragment);
    }

    return fragment;
  };

  return appendChild;
};

export default buildAppendChild;
