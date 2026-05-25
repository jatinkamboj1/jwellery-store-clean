import {jwtDecode} from "jwt-decode";

export default function Decoder(token) {
  return jwtDecode(token);
}
