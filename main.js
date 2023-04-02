const PLANTUML_SERVER_URL_PREFIX = 'https://www.plantuml.com/plantuml/png/~1';

function onOpen() {
  DocumentApp.getUi().createAddonMenu()
    .addItem('PlantUML xcronic', 'showSidebar')
    .addToUi();
}

function showSidebar() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('sidebar')
    .setTitle('PlantUML xcronic');

  DocumentApp.getUi().showSidebar(htmlOutput);
}

function generatePlantUML(plantUML) {
    const encodedUML = encodePlantUML(plantUML);
    const diagramUrl = PLANTUML_SERVER_URL_PREFIX + encodedUML;
    console.log('diagramUrl: '+diagramUrl);

    return diagramUrl;
}

function encodePlantUML(plantUML) {
  try{
    return plantumlEncoder.encodePlantUML(plantUML);
  } catch (error) {
      console.error('Error: ' + error.message + '\nStack trace: ' + error.stack);
      return '';
  }
}

function insertPlantUML(imgSrc) {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const selection = doc.getSelection();
  const cursor = doc.getCursor();
  const blob = UrlFetchApp.fetch(imgSrc).getBlob();
  
  let insertPosition;
  if (selection) {
    const rangeElements = selection.getRangeElements();
    insertPosition = rangeElements[0].getStartOffset();
    for (var i = 0; i < rangeElements.length; i++) {
      var rangeElement = rangeElements[i];

      if (rangeElement.isPartial()) {
        var startOffset = rangeElement.getStartOffset();
        var endOffset = rangeElement.getEndOffsetInclusive();
        rangeElement.getElement().asText().deleteText(startOffset, endOffset);
      } else {
        try {
          rangeElement.getElement().removeFromParent();
        } catch (error) {
          DocumentApp.getUi().alert(error);
        }
      }
    }
  } else if (cursor) {
    insertPosition = body.getChildIndex(cursor.getElement());
  } else {
    DocumentApp.getUi().alert('Cannot find the cursor position in the document.');
    return;
  }

  const image = body.insertImage(Math.max(0,insertPosition), blob);

  const docWidth = getDocWidth() / 2;
  const imgRatio = image.getHeight() / image.getWidth();
  const newHeight = Math.round(docWidth * imgRatio);
  image.setWidth(docWidth);
  image.setHeight(newHeight);
  image.setLinkUrl(imgSrc);
}

function getDocWidth() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  return body.getPageWidth() - body.getMarginLeft() - body.getMarginRight();
}

function getSelectedPlantUMLURL() {
  const doc = DocumentApp.getActiveDocument();
  const selection = doc.getSelection();

  if (selection) {
    const elements = selection.getRangeElements();
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i].getElement();
      if (element.getType() === DocumentApp.ElementType.INLINE_IMAGE) {
        const inlineImage = element.asInlineImage();
        const plantUMLURL = inlineImage.getLinkUrl();
        if (plantUMLURL && plantUMLURL.startsWith(PLANTUML_SERVER_URL_PREFIX)) {
          const encodedUML = plantUMLURL.replace(PLANTUML_SERVER_URL_PREFIX, '');
          const decodedUML = decodePlantUML(encodedUML);
          return decodedUML;
        }
      }
    }
  }
  return null;
}



