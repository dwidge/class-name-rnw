// Copyright DWJ 2024.
// Distributed under the Boost Software License, Version 1.0.
// https://www.boost.org/LICENSE_1_0.txt

import React, { ComponentType, ForwardedRef, useMemo } from "react";
import { withTheme } from "@rneui/themed";

export type WithClassNameProps<StyleType> = {
  themeKey?: string;
  className?: string;
  stylesheet?: Record<string, StyleType>;
  style?: StyleType;
};

export const withClassName =
  <StyleType extends Record<string, any>>(
    Wrapper = ({
      children,
    }: WithClassNameProps<StyleType> & { children: React.JSX.Element }) =>
      children,
  ) =>
  <P extends object>(Component: ComponentType<P>, themeKey?: string) =>
    withTheme(
      React.forwardRef<unknown, P & WithClassNameProps<StyleType>>(
        (
          { className = "", stylesheet, style, ...restProps },
          ref: ForwardedRef<any>,
        ) => (
          <Wrapper
            {...{
              themeKey,
              className,
              stylesheet,
              style,
              ...restProps,
            }}
          >
            <Component
              ref={ref}
              style={useMemo<StyleType>(
                () =>
                  flatten([
                    ...(Array.isArray(style) ? style : [style]),
                    ...getMatchedStyles(getClassNames(className), stylesheet),
                  ]),
                [className, stylesheet, style],
              )}
              {...(restProps as P)}
            />
          </Wrapper>
        ),
      ),
      themeKey,
    ) as ComponentType<P & WithClassNameProps<StyleType>>;

const flatten = <StyleType extends Record<string, any>>(
  s: (StyleType | undefined)[],
): StyleType => Object.assign({}, ...s.filter(Boolean));

const getClassNames = (className?: string): string[] =>
  className ? className.split(" ").filter(Boolean) : [];

const getMatchedStyles = <StyleType extends Record<string, any>>(
  classNames: string[],
  stylesheet?: Record<string, StyleType>,
): StyleType[] =>
  stylesheet
    ? Object.keys(stylesheet)
        .sort()
        .filter((key) =>
          getClassNames(key).every((cls) => classNames.includes(cls)),
        )
        .map((matchedKey) => stylesheet[matchedKey])
    : [];
