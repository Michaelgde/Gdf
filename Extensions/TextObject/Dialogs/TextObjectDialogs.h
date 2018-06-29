//////////////////////////////////////////////////////////////////////
// This file was auto-generated by codelite's wxCrafter Plugin
// wxCrafter project file: TextObjectEditor.wxcp
// Do not modify this file by hand!
//////////////////////////////////////////////////////////////////////

#ifndef TEXTOBJECT_DIALOGS_TEXTOBJECTEDITOR_BASE_CLASSES_H
#define TEXTOBJECT_DIALOGS_TEXTOBJECTEDITOR_BASE_CLASSES_H

#include <wx/arrstr.h>
#include <wx/artprov.h>
#include <wx/aui/auibar.h>
#include <wx/aui/dockart.h>
#include <wx/aui/framemanager.h>
#include <wx/button.h>
#include <wx/combobox.h>
#include <wx/dialog.h>
#include <wx/hyperlink.h>
#include <wx/iconbndl.h>
#include <wx/menu.h>
#include <wx/panel.h>
#include <wx/pen.h>
#include <wx/settings.h>
#include <wx/sizer.h>
#include <wx/statbmp.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/toolbar.h>
#include <wx/xrc/xh_bmp.h>
#include <wx/xrc/xmlres.h>
#include <map>

class TextObjectEditorBase : public wxDialog {
 public:
  enum {
    BOLD_TOOL_ID = 10001,
    CHANGE_FONT_BUTTON = 10002,
    COLOR_TOOL_ID = 10003,
    ITALIC_TOOL_ID = 10004,
    UNDER_TOOL_ID = 10005,
  };

 protected:
  wxAuiManager* m_auimgr;
  wxAuiToolBar* m_toolbar;
  wxTextCtrl* m_fontTextCtrl;
  wxComboBox* m_sizeCombobox;
  wxPanel* m_centerPanel;
  wxTextCtrl* m_textCtrl;
  wxStaticText* m_staticText62;
  wxStaticBitmap* m_staticBitmap80;
  wxHyperlinkCtrl* m_helpBt;
  wxStdDialogButtonSizer* m_stdBtnSizer40;
  wxButton* m_okButton;
  wxButton* m_cancelButton;

 protected:
  virtual void OnChangeFontButton(wxCommandEvent& event) { event.Skip(); }
  virtual void OnSizeComboboxSelectionChanged(wxCommandEvent& event) {
    event.Skip();
  }
  virtual void OnSizeComboboxUpdated(wxCommandEvent& event) { event.Skip(); }
  virtual void OnColorToolClicked(wxCommandEvent& event) { event.Skip(); }
  virtual void OnBoldToolClicked(wxCommandEvent& event) { event.Skip(); }
  virtual void OnItalicToolClicked(wxCommandEvent& event) { event.Skip(); }
  virtual void OnUnderlineToolClicked(wxCommandEvent& event) { event.Skip(); }
  virtual void OnHelpBtClicked(wxHyperlinkEvent& event) { event.Skip(); }
  virtual void OnOkBtClicked(wxCommandEvent& event) { event.Skip(); }

 public:
  TextObjectEditorBase(wxWindow* parent,
                       wxWindowID id = wxID_ANY,
                       const wxString& title = _("Edit the Text object"),
                       const wxPoint& pos = wxDefaultPosition,
                       const wxSize& size = wxSize(-1, -1),
                       long style = wxDEFAULT_DIALOG_STYLE | wxRESIZE_BORDER |
                                    wxMAXIMIZE_BOX);
  virtual ~TextObjectEditorBase();
};

#endif
