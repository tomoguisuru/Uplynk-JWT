import "./styles.css";
import * as jose from "jose";

import React, { useRef } from "react";

import { Button, Container, Form } from "react-bootstrap";
import Stack from "react-bootstrap/Stack";

interface IJwtData {
  sub: string;
  kid: string;
  key: string;
  alg: string;
  scope: string[];
  exp?: string;
}

async function sign(data: IJwtData) {
  const alg = data.alg;
  const key = await jose.importPKCS8(atob(data.key), alg);

  const hasExp = !!data["exp"];

  const payload = {
    sub: data.sub,
    scp: data.scope,
  };

  if (!hasExp) {
    payload["net"] = true;
  }

  const jwt = new jose.SignJWT(payload)
    .setProtectedHeader({ alg, kid: data.kid, typ: "JWT" })
    .setIssuedAt();

  if (hasExp) {
    jwt.setExpirationTime(`${data.exp}`);
  }

  return jwt.sign(key);
}

export default function App() {
  const subRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const kidRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const keyRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const algRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const expRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const jwtRef = useRef() as React.MutableRefObject<HTMLTextAreaElement>;
  const scope: string[] = [];
  let jwtStr = "";
  // let jwt: string = '';

  function loadSaved() {
    subRef.current.value = localStorage.getItem("sub") || "";
    kidRef.current.value = localStorage.getItem("kid") || "";
    keyRef.current.value = localStorage.getItem("key") || "";
    algRef.current.value = localStorage.getItem("alg") || "";
    expRef.current.value = localStorage.getItem("exp") || "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: call sign;
    jwtStr = await sign({
      scope,
      sub: subRef.current.value,
      kid: kidRef.current.value,
      key: keyRef.current.value,
      alg: algRef.current.value,
      exp: expRef.current.value,
    });

    jwtRef.current.value = jwtStr;
  }

  function saveValue(
    index: string,
    el: React.MutableRefObject<HTMLInputElement>
  ) {
    localStorage.setItem(index, el.current.value);
  }

  function updateScope(value: string) {
    const idx = scope.indexOf(value);

    if (idx > -1) {
      scope.splice(idx, 1);
    } else {
      scope.push(value);
    }
  }

  return (
    <div className="App">
      <Container className="my-4">
        <h1>Uplynk JWT</h1>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="workspaceId">
            <Form.Label>SUB</Form.Label>
            <Form.Control
              required
              type="text"
              ref={subRef}
              onChange={() => saveValue("sub", subRef)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="keyId">
            <Form.Label>KID</Form.Label>
            <Form.Control
              required
              type="text"
              ref={kidRef}
              onChange={() => saveValue("kid", kidRef)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="key">
            <Form.Label>KEY</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="base64 encoded key"
              ref={keyRef}
              onChange={() => saveValue("key", keyRef)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="encoding">
            <Form.Label>ALG</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="ES256"
              ref={algRef}
              onChange={() => saveValue("alg", algRef)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exp">
            <Form.Label>Expires in</Form.Label>
            <Form.Control
              type="text"
              placeholder="3m"
              ref={expRef}
              onChange={() => saveValue("exp", expRef)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="scope">
            <Form.Label>Scope</Form.Label>
            {[
              "video.services.assets:read",
              "video.services.assets:write",
              "video.services.channels:read",
              "video.services.channels:write",
              "video.services.channels.schedule:read",
              "video.services.channels.schedule:write",
              "video.services.failover-groups:read",
              "video.services.failover-groups:write",
              "video.services.libraries:read",
              "video.services.libraries:write",
              "video.services.libraries.users:admin",
              "video.services.workspace.api_key:read",
              "video.services.workspace.api_key:update",
              "video.services.workspace.api_key:admin",
            ].map((e, i) => (
              <Form.Check
                type="checkbox"
                id={`checkbox-${i}`}
                key={i}
                label={e}
                onChange={() => updateScope(e)}
              />
            ))}
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Stack direction="horizontal" gap={2}>
              <Button variant="secondary" onClick={() => loadSaved()}>
                Load From localStorage
              </Button>
              <Button variant="primary" type="submit">
                Generate
              </Button>
            </Stack>
          </div>

          <Form.Label>JWT</Form.Label>
          <Form.Control as="textarea" rows={7} ref={jwtRef} readOnly />
        </Form>
      </Container>
    </div>
  );
}
