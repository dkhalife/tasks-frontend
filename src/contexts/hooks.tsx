import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function withLocation<Props>(Component: any): (props: Props) => JSX.Element {
  return function impl(props) {
    return <Component {...props} location={useLocation()} />;
  }
} 

export function withNavigation<Props>(Component: any): (props: Props) => JSX.Element {
  return function impl(props) {
    return <Component {...props} navigate={useNavigate()} />;
  }
} 