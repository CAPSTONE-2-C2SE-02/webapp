import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

interface PrivacyPolicyTermProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

const PrivacyPolicyTerm = ({
  isOpen,
  onClose,
  onAccept,
  onDecline,
}: PrivacyPolicyTermProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh]"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-primary">
            Privacy Policy and Terms of Service
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 text-sm">
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed text-sm">
                Before creating an account, please carefully read the following
                terms to understand how we collect, use, and protect your
                personal information.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-base text-teal-700">
                Personal Information Security
              </h3>

              <p className="text-gray-700 leading-relaxed">
                TripConnect is committed to absolutely protecting your personal
                information.
              </p>

              <p className="text-gray-700 leading-relaxed">
                All information such as: full name, email, phone number, profile
                picture, and content you provide will be stored securely and
                will not be shared with third parties without your consent,
                except when required by law.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-base text-teal-700">
                Data Collection
              </h3>

              <p className="text-gray-700 leading-relaxed">
                When registering and using the platform, we may collect the
                following data:
              </p>

              <ul className="text-gray-700 space-y-2 ml-6">
                <li>
                  • <strong>Registration information:</strong> name, email,
                  password, profile picture
                </li>
                <li>
                  • <strong>For tour guides:</strong> identity verification
                  documents, tour information
                </li>
                <li>
                  • <strong>Usage behavior:</strong> search history, tour
                  bookings, chat, reviews
                </li>
                <li>
                  • <strong>Payment information</strong> (through secure
                  third-party intermediaries)
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-base text-teal-700">
                Purpose of Information Use
              </h3>

              <p className="text-gray-700 leading-relaxed">
                Your information will be used to:
              </p>

              <ul className="text-gray-700 space-y-2 ml-6">
                <li>
                  • Provide and personalize services (tour suggestions, schedule
                  arrangements, etc.)
                </li>
                <li>
                  • Support communication and tour booking between users and
                  tour guides
                </li>
                <li>• Ensure security during payment and review processes</li>
                <li>• Improve user experience and platform development</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-base text-teal-700">
                Your Rights
              </h3>

              <p className="text-gray-700 leading-relaxed">
                You have the right to:
              </p>

              <ul className="text-gray-700 space-y-2 ml-6">
                <li>
                  • View, edit, or delete your personal information at any time
                </li>
                <li>
                  • Cancel your account if you no longer wish to use the service
                </li>
                <li>
                  • File complaints or request support through TripConnect's
                  official email
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-base text-teal-700">
                Prohibited Content
              </h3>

              <p className="text-gray-700 leading-relaxed">
                When participating in TripConnect, you are not allowed to:
              </p>

              <ul className="text-gray-700 space-y-2 ml-6">
                <li>
                  • Post content that violates laws, ethics, or offends others
                </li>
                <li>
                  • Impersonate personal information or deceive other users
                </li>
                <li>• Use the platform for unauthorized commercial purposes</li>
              </ul>
            </div>

            <div className="space-y-4 bg-teal-50 p-4 rounded-lg">
              <h3 className="font-semibold text-base text-teal-800">
                Confirmation Agreement
              </h3>

              <p className="text-gray-700 leading-relaxed">
                By clicking "Accept", you confirm that:
              </p>

              <ul className="text-gray-700 space-y-2 ml-6">
                <li>
                  • You have read, understood, and agree to all the terms above
                </li>
                <li>
                  • You agree to allow TripConnect to collect and use
                  information as described
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button
            onClick={() => {
              onAccept();
              onClose();
            }}
          >
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyTerm;
