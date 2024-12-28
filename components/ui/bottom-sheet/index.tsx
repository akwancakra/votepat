import React, { Fragment, forwardRef, useCallback } from "react";
import BottomSheet, {
  BottomSheetView as BSView,
  BottomSheetModalProvider,
  BottomSheetModal as BSModal,
  BottomSheetScrollView as BSScrollView,
  BottomSheetHandle as BSHandle,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import type { BottomSheetModal as BSModalType } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import { BottomSheetProps, BSHandleProps } from "./types";

const BottomSheetTrigger = Fragment;

type BottomSheetModal = BSModalType;

const BottomSheetModal = forwardRef<
  BSModal,
  BottomSheetProps & { children: React.ReactNode; isOpen?: boolean }
>(({ children, ...rest }: BottomSheetProps, ref) => {
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.4}
      />
    ),
    []
  );

  return (
    <BSModal 
      ref={ref} 
      backdropComponent={renderBackdrop}
      {...rest}
    >
      {children}
    </BSModal>
  );
});

const BottomSheetView = cssInterop(BSView, {
  className: "style",
});

const BottomSheetScrollView = cssInterop(BSScrollView, {
  className: "style",
  contentContainerclassName: "contentContainerStyle",
});

const BottomSheetHandle: React.FC<BSHandleProps> = BSHandle;

export {
  BottomSheet,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTrigger,
  BottomSheetHandle,
};
