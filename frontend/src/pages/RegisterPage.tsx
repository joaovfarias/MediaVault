import MVLogoText from "../assets/MVLogoText.png";
import { useState, type FormEvent } from "react";
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Snackbar,
} from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    mostrarSenha: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [erroMessage, setErroMessage] = useState(
    "Falha ao cadastrar. Tente novamente.",
  );
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const handleSendForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.password.length < 5) {
      setPasswordError("A senha deve ter no mínimo 5 caracteres");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return;
    }

    setPasswordError("");

    fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          setErroMessage("Falha ao cadastrar. Tente novamente.");
          setShowErrorSnackbar(true);
          throw new Error(data.message || "Failed to register");
        });
      }
      return response
        .json()
        .then(
          (data: {
            token?: string;
            _id: string;
            username: string;
            email: string;
          }) => {
            if (data.token) {
              localStorage.setItem("token", data.token);
            }

            localStorage.setItem("user", JSON.stringify(data));

            navigate("/");
          },
        );
    });
  };

  const handleClickShowPassword = () => {
    setFormData((prev) => ({ ...prev, mostrarSenha: !prev.mostrarSenha }));
  };

  return (
    <div className="relative min-h-[calc(100vh-128px)] flex flex-col items-center justify-center overflow-hidden">
      <img src={MVLogoText} alt="MediaVault Logo" className="w-40" />
      <form
        onSubmit={handleSendForm}
        className="w-full max-w-sm mt-4 gap-3 flex flex-col"
      >
        <TextField
          label="username"
          type="text"
          variant="outlined"
          fullWidth
          size="medium"
          value={formData.username}
          InputLabelProps={{
            sx: {
              "&.Mui-focused": {
                color: "#006D7A",
              },
            },
          }}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#006D7A",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#006D7A",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: "#006D7A",
              },
          }}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, username: e.target.value }))
          }
          required
        />
        <TextField
          label="email"
          type="email"
          variant="outlined"
          fullWidth
          size="medium"
          value={formData.email}
          InputLabelProps={{
            sx: {
              "&.Mui-focused": {
                color: "#006D7A",
              },
            },
          }}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#006D7A",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#006D7A",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: "#006D7A",
              },
          }}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          required
        />
        <FormControl variant="outlined" fullWidth required>
          <InputLabel
            htmlFor="senha"
            sx={{
              "&.Mui-focused": {
                color: "#006D7A",
              },
            }}
          >
            senha
          </InputLabel>
          <OutlinedInput
            id="senha"
            type={formData.mostrarSenha ? "text" : "password"}
            value={formData.password}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#006D7A",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#006D7A",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#006D7A",
              },
            }}
            onChange={(e) =>
              setFormData((prev) => {
                const nextPassword = e.target.value;
                setPasswordError(
                  nextPassword.length > 0 && nextPassword.length < 5
                    ? "A senha deve ter no mínimo 5 caracteres"
                    : prev.confirmPassword &&
                        nextPassword !== prev.confirmPassword
                      ? "As senhas não coincidem"
                      : "",
                );

                return { ...prev, password: nextPassword };
              })
            }
            inputProps={{ minLength: 5 }}
            label="Senha"
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    formData.mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                  }
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {formData.mostrarSenha ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControl
          variant="outlined"
          fullWidth
          required
          error={Boolean(passwordError)}
        >
          <InputLabel
            htmlFor="confirmar-senha"
            sx={{
              "&.Mui-focused": {
                color: "#006D7A",
              },
            }}
          >
            confirmar senha
          </InputLabel>
          <OutlinedInput
            id="confirmar-senha"
            type={formData.mostrarSenha ? "text" : "password"}
            value={formData.confirmPassword}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#006D7A",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#006D7A",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#006D7A",
              },
            }}
            onChange={(e) =>
              setFormData((prev) => {
                const nextConfirmPassword = e.target.value;
                setPasswordError(
                  prev.password.length > 0 && prev.password.length < 5
                    ? "A senha deve ter no mínimo 5 caracteres"
                    : nextConfirmPassword &&
                        prev.password !== nextConfirmPassword
                      ? "As senhas não coincidem"
                      : "",
                );

                return {
                  ...prev,
                  confirmPassword: nextConfirmPassword,
                };
              })
            }
            inputProps={{ minLength: 5 }}
            label="Confirmar senha"
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    formData.mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                  }
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {formData.mostrarSenha ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
          {passwordError && <FormHelperText>{passwordError}</FormHelperText>}
        </FormControl>
        <button
          type="submit"
          className="bg-[#006D7A] text-white py-2 px-4 rounded-md hover:bg-[#005a6b] cursor-pointer"
        >
          Cadastrar
        </button>
      </form>

      <p className="mt-4 text-sm text-[#444746]">
        Já possui uma conta?{" "}
        <a href="/login" className="text-[#006D7A] hover:underline">
          Faça login
        </a>
      </p>

      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowErrorSnackbar(false)}
        message={erroMessage}
      />
    </div>
  );
}
