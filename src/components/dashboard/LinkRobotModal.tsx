"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LinkRobotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkRobot: (uuid: string) => void;
}

export default function LinkRobotModal({
  isOpen,
  onClose,
  onLinkRobot,
}: LinkRobotModalProps) {
  const [uuid, setUuid] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uuid.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un UUID válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Validar formato UUID básico
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(uuid.trim())) {
        throw new Error("Formato de UUID inválido");
      }

      await onLinkRobot(uuid.trim());

      toast({
        title: "Éxito",
        description: "Robot vinculado correctamente",
      });

      setUuid("");
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al vincular el robot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUuid("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5" style={{ color: "#0057a3" }} />
            <span>Vincular Robot</span>
          </DialogTitle>
          <DialogDescription>
            Ingresa el UUID del robot que deseas vincular a tu cuenta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="uuid">UUID del Robot</Label>
              <Input
                id="uuid"
                type="text"
                placeholder="f7e6de09-0d83-45e2-9d1b-a4dc4aa1c8cc"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                className="font-mono text-sm"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                El UUID debe tener el formato:
                xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="text-white"
              style={{ backgroundColor: "#0057a3" }}
            >
              <Link className="h-4 w-4 mr-2" />
              {isLoading ? "Vinculando..." : "Vincular Robot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
